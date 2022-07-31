import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar(props) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    Uni3
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/create">
                                Create Record
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            {props.connectedAddress}
                        </li>
                        <li className="nav-item">
                            {parseFloat(props.userBalance).toFixed(2)}
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Balance
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">ETH - {props.balances.eth}</a></li>
                                <li><a className="dropdown-item" href="#">USDc - {props.balances.usdc}</a></li>
                                <li><a className="dropdown-item" href="#">UNI - {props.balances.UNI}</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

        </nav>
    );
}