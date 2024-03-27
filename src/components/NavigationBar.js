import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import socket from "./socket";

function NavigationBar() {
  let [host, setHost] = useState("");
  let [showModal, setShowModal] = useState(false);

  let navigate = useNavigate();

  const activeLink = {
    color: "orange",
    fontSize: "120%",
  };
  const inactiveLink = {
    color: "white",
  };
  function handleLogout() {
    let host = localStorage.getItem("userId");
    socket.emit("remove-user", host);
    localStorage.clear();
    navigate("/login");
  }
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .post("https://chtvthme.onrender.com/user-api/pathjump", { token: token })
      .then((res) => {
        if (res.data.success !== true) {
          localStorage.clear();
          setHost("");
          navigate("/");
        } else {
          const user = localStorage.getItem("user");
          setHost(user);
        }
      })
      .catch((err) => alert("Error: " + err.message));
  }, [localStorage.getItem("user")]);
  return (
   
    <div className="w-100">
  <nav className="navbar navbar-expand-lg navbar-dark bg-success">
    <NavLink className="navbar-brand" to="/">
      
      <span className="fs-4">Chat App</span>
    </NavLink>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="ms-auto navbar-nav">
        {host.length === 0 && (
          <>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/"
                activeClassName="active"
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/login"
                activeClassName="active"
              >
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/register"
                activeClassName="active"
              >
                Register
                {"  "}
              </NavLink>
            </li>
          </>
        )}
        
        {host.length !== 0 && (
          
          <li className="nav-item">
            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
              {"   "}
            </button>
          </li>
        )}
      </ul>
    </div>
  </nav>
</div>

  );
}

export default NavigationBar;
