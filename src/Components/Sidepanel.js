import React from "react";
import { Link, useLocation} from "react-router-dom";


function Sidepanel() {
    const location = useLocation();

    return (
        <div className="sidepanel">
            <ul>
                <li className={location.pathname === "/index.html" ? "active" : ""}>
                    <Link to="/index.html">Dashboard</Link>
                </li>
                <li className={location.pathname === "/blocked-websites" ? "active" : ""}>
                    <Link to="/blocked-websites">Blocked websites</Link>
                </li>
                <li className={location.pathname === "/customize" ? "active" : ""}>
                    <Link to="/customize">Customize</Link>
                </li>
                <li className={location.pathname === "/notifications" ? "active" : ""}>
                    <Link to="/notifications">Notifications</Link>
                </li>
            </ul>
        </div>
    );
}

export default Sidepanel;

