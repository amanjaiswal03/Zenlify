import React from "react";
import { Link } from "react-router-dom";

function Sidepanel() {
    return (
        <div className="sidepanel">
            <ul>
                <li><a href="#">Dashboard</a></li>
                {/* <Link to = "/blocked-websites"><li><a href="#">Blocked websites</a></li></Link> */}
                <li><a href="#">Customize</a></li>
                <li><a href="#">Notifications</a></li>
            </ul>
        </div>
    );
}

export default Sidepanel;

