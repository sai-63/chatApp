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
    let host = localStorage.getItem("user");
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
    /*<div className="h-auto p-0 w-100">
      <nav className="h-auto m-0  navbar navbar-expand-lg navbar-primary bg-primary">
        <NavLink className="nav-link m-1 navbar-brand" to="/">
          <img
            alt=""
            className="me-2 border"
            style={{ borderRadius: "50%", width: "3rem" }}
            src="https://static.vecteezy.com/system/resources/previews/009/116/929/original/cvm-logo-cvm-letter-cvm-letter-logo-design-initials-cvm-logo-linked-with-circle-and-uppercase-monogram-logo-cvm-typography-for-technology-business-and-real-estate-brand-vector.jpg"
          />
          <p className="d-inline mt-2 fs-4 " style={{ position: "absolute" }}>
            Cht Vth Me
          </p>
        </NavLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="ms-auto navbar-nav align-items-center me-2">
            {host.length === 0 && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/"
                  style={({ isActive }) => {
                    return isActive ? activeLink : inactiveLink;
                  }}
                >
                  Home
                </NavLink>
              </li>
            )}
            {host.length === 0 && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/login"
                  style={({ isActive }) => {
                    return isActive ? activeLink : inactiveLink;
                  }}
                >
                  Login
                </NavLink>
              </li>
            )}
            {host.length === 0 && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/register"
                  style={({ isActive }) => {
                    return isActive ? activeLink : inactiveLink;
                  }}
                >
                  Register
                </NavLink>
              </li>
            )}
            {host.length !== 0 && (
              <Button
                className="text-white btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </ul>
        </div>
      </nav>
    </div>*/
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
