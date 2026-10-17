import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy · Game Library",
  description: "How Game Library and its GameLibrary Backup tool handle your data.",
};

// Public page (no sign-in): Google requires a privacy policy link for the
// "GameLibrary Backup" OAuth app that rclone uses for Google Drive backups.
const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">Game Library</p>
            <h1 className="text-4xl font-semibold text-white/90">Privacy policy</h1>
            <p className="mt-2 text-sm text-white/50">Last updated: 17 October 2026</p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
          >
            ← Back home
          </Link>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/75 shadow-2xl shadow-black/30 backdrop-blur-2xl leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">About this app</h2>
            <p>
              Game Library is a personal, non-commercial website for keeping track of the video games its
              owner plays. &quot;GameLibrary Backup&quot; is the name of the Google API project it uses to back
              up that library to the owner&apos;s own Google Drive.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">What data is stored</h2>
            <p>
              The app stores the games you add (names, years, completion status, notes) and the images and
              videos you upload. This data is kept on the app owner&apos;s own computer. Sign-in is handled by
              Firebase Authentication, which stores your email address and a hashed password.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Google Drive access</h2>
            <p>
              When the owner presses &quot;Back up to Google Drive&quot;, the backup tool (rclone) copies the
              library&apos;s database and uploaded files into a <code>GameLibrary</code> folder in the
              owner&apos;s Google Drive. It uses the <code>drive.file</code> permission, which only allows
              access to files the tool itself created. It cannot see, read or change any other files in
              Google Drive.
            </p>
            <p>
              Data obtained through Google APIs is used only to store and restore these backups. It is not
              shared with, sold to, or transferred to anyone, and it is not used for advertising or any other
              purpose. The app&apos;s use of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-sky-300 underline-offset-4 hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Sharing and retention</h2>
            <p>
              No data is sold or shared with third parties. Data is kept until it is deleted in the app. The
              Google Drive backup mirrors the library, so items deleted in the app are removed from the backup
              at the next backup. You can revoke the backup tool&apos;s access at any time in your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-sky-300 underline-offset-4 hover:underline"
              >
                Google Account permissions
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>
              Questions about this policy can be raised on the project&apos;s{" "}
              <a
                href="https://github.com/Sajeewa30/gamelibrary-nextjs/issues"
                className="text-sky-300 underline-offset-4 hover:underline"
              >
                GitHub page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
