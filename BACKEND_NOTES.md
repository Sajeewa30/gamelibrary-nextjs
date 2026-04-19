# Backend coordination notes

These are the findings and instructions for the Spring Boot backend Claude agent.
The frontend (this Next.js app) is deployed on Railway. The backend is deployed
on Railway as well, free plan, and has been crashing frequently.

---

## Symptoms the user is seeing

1. Frontend deployed page does not show database data on load.
2. Free Railway plan resources are tight — backend crashes often.
3. Browser console shows CORS errors on requests to backend endpoints.

Only one of those needs to be true for "no data on the page". Check them in order.

---

## What the frontend just changed (context for the backend)

These changes were made on the Next.js side to reduce backend load. Keep them
in mind when debugging:

1. **Deduped in-flight GETs** — identical GETs fired concurrently (e.g. React
   strict mode, fast nav) are now collapsed into a single request on the client.
2. **Client session-storage cache (2 min TTL) for every list page** — after the
   first visit, list pages render from cache while revalidating in the
   background. That means the backend should see **fewer** read requests per
   session, not more.
3. **KeepAlive pings gated on auth + tab visibility** — `/health` is only
   called when a user is signed in AND the tab is visible. Exponential backoff
   on failure. Auto-disables after 6 consecutive failures per tab.
   If you were relying on `/health` to measure uptime from anonymous visitors,
   that traffic is gone now.
4. **Request timeout of 15 s** on the frontend. Any endpoint that normally
   takes longer than 15 s will surface as "Request timed out" to the user.
5. **Typed ApiError in the frontend** distinguishes `network` (CORS / fetch
   failure / DNS) from `http` (non-2xx response). If the user reports
   "Cannot reach the backend", it's the former — either backend is down or
   CORS is blocking.

---

## Required backend actions (do these first)

### 1. Verify CORS configuration

The frontend will be served from a Railway domain like
`https://<something>.up.railway.app` (or a custom domain). CORS must allow:

- **Origin**: the exact frontend URL (not `*` when using credentials).
- **Methods**: `GET, POST, PUT, DELETE, OPTIONS`.
- **Headers**: `Authorization, Content-Type`.
- **Preflight** (`OPTIONS`) must return 204/200 with the CORS headers present,
  BEFORE any filter rejects unauthenticated requests. Spring Security in
  particular will 403 the preflight if CORS isn't registered before the
  security filter chain.

Recommended Spring setup (adjust class names to your project):

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            System.getenv().getOrDefault("FRONTEND_ORIGIN", "")
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type"));
        config.setAllowCredentials(false); // Bearer token, not cookies
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

And in the SecurityFilterChain:

```java
http.cors(Customizer.withDefaults())
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers("/public/**", "/health").permitAll()
        .requestMatchers("/admin/**").authenticated()
        .anyRequest().permitAll()
    );
```

Set `FRONTEND_ORIGIN` in Railway to the production Next.js URL. **Do not use
a wildcard with credentials.** If the user ever migrates to cookie auth, this
will silently break.

### 2. Verify database connectivity in the deployed environment

"No data from the database" on deploy usually means one of:

- DB connection string points to a local DB that doesn't exist on Railway.
- DB credentials env var not set on the Railway backend service.
- DB service is a separate Railway add-on that isn't linked to the backend.
- Firewall/IP allowlist blocks the Railway egress IP (Atlas, etc.).

Log the JDBC URL at startup (mask the password) and check Railway logs after a
cold boot. If connections are fine but queries return empty, confirm you're
hitting the right schema — dev DB vs prod DB mix-ups are the most common cause.

### 3. Reduce memory/CPU pressure (so Railway stops crashing)

Java on a free-plan container is heavy by default. Things that help **a lot**:

- **JVM flags**: run with something like
  `JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss256k`
  on small containers. `-XX:+UseSerialGC` uses less memory than G1.
- **Connection pool size**: HikariCP default is 10. On free tier, set
  `spring.datasource.hikari.maximum-pool-size=3` and
  `spring.datasource.hikari.minimum-idle=1`.
- **Disable unused Spring auto-config** you don't use (DevTools, Actuator
  endpoints you never query, etc.).
- **Log level**: set root log level to `WARN` in production. Each log line
  costs CPU and disk I/O.
- **Tomcat threads**: `server.tomcat.threads.max=20` is plenty for a personal
  app; the default 200 reserves too much memory per worker.

### 4. Make `/health` cheap

If `/health` hits the DB on every call, each keepalive ping compounds load.
The frontend pings every 5 minutes while the tab is open. Make `/health`:

- Return a static string / 200 without touching the DB.
- Optionally expose `/health/db` as a separate, rarely-called deeper check.

### 5. Check cold-start behavior

If Railway is restarting the service on each idle period, first request after
a cold start will be slow. The frontend now times out at 15 seconds — if a
cold boot + first JPA query exceeds that, the user sees "Request timed out".

Mitigations:
- Keep the service warm only while a user is active (the frontend does this
  via the new KeepAlive component). Do not add extra cron pings server-side.
- Enable Hibernate lazy initialization (`spring.jpa.defer-datasource-initialization`)
  to shorten startup.
- Consider `spring.main.lazy-initialization=true` — initializes beans on first
  use instead of at boot.

### 6. Media upload endpoints

`POST /admin/games/{id}/media` and `POST /admin/uploadImage` accept multipart
FormData. On a memory-constrained container:

- Set `spring.servlet.multipart.max-file-size` and `max-request-size` low
  (e.g. 10MB) to avoid OOM on large uploads.
- Stream uploads directly to S3 rather than buffering the whole file in
  memory. Spring's `MultipartFile.getInputStream()` plus S3 SDK multipart
  upload is the right shape.

---

## Endpoints the frontend calls (contract check)

Make sure each of these exists, returns JSON where applicable, and returns
the field names the frontend expects:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | public | Keepalive. Return 200 cheaply. DB-free. |
| GET | `/health/db` | public | Deeper check. Not called by keepalive. |
| GET | `/admin/fullGameCount` | bearer | `{ fullGameCount: number }` |
| GET | `/admin/games/{id}` | bearer | Full game detail |
| GET | `/admin/games/byYear/{year}` | bearer | `GameType[]` |
| GET | `/admin/getFavouriteGames` | bearer | `GameType[]` |
| GET | `/admin/getHundredPercentCompletedGames` | bearer | `GameType[]` |
| GET | `/admin/games/toBeCompleted` | bearer | `GameType[]` |
| POST | `/admin/addGameItem` | bearer | JSON body |
| PUT | `/admin/games/{id}` | bearer | JSON body, returns updated game |
| DELETE | `/admin/games/{id}` | bearer | |
| PUT | `/admin/games/{id}/note` | bearer | JSON body |
| POST | `/admin/games/{id}/media` | bearer | multipart/form-data |
| DELETE | `/admin/games/{id}/media` | bearer | JSON `{url,type}` |
| POST | `/admin/uploadImage` | bearer | multipart/form-data, returns URL as `text/plain` |

`GameType` as the frontend expects:

```ts
{
  id | _id | gameId | itemId: string;
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean; // also accepts `completed`
  isHundredPercent: boolean; // also accepts `hundredPercent`
  isFavourite: boolean; // also accepts `favourite`
  specialDescription: string;
  imageUrl: string;
}
```

The frontend tolerates both `isCompleted` / `completed` etc — but prefer the
`isXxx` naming on the server for consistency. Pick one and stick with it.

---

## Suggested order of operations

1. Open the deployed frontend and the browser devtools Network tab.
2. Visit `/Favourites`. Observe the request to `/admin/getFavouriteGames`.
   - If it fails with CORS error → fix CORS (section 1).
   - If it fails with 500 → check backend logs for DB errors (section 2).
   - If it fails with 401 → Firebase Bearer token not validating server-side.
   - If it times out → cold start + slow first query (section 5).
3. Once a list loads, confirm the count on `/` home page.
4. Apply memory tuning (section 3) and redeploy. Watch Railway metrics.
5. Replace `/health` with a DB-free probe (section 4).

If you want the frontend agent to make further coordinated changes (e.g. add
a header, add a new field, add a retry-after policy), leave a note in this
file — the frontend agent should read it on its next session.
