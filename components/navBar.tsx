import React from "react";

export const NavBar = () => {
    return(
        <div className="nav-links" id="navLinks">
                <i className="fa fa-times" onclick="hideMenu()"></i>
                <ul>
                    <li><a href="">FAVOURITES</a></li>
                    <li><a href="">2024</a></li>
		            <li><a href="">2025</a></li>
                </ul>
            </div>
    )
}