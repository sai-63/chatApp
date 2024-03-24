import React, { useEffect, useState } from "react";
import { Button, NavLink, useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";

function NavigationBar() {
  const [host, setHost] = useState("");
  const navigate = useNavigate();
  let hubConnection = null;

  const activeLink = {
    color: "orange",
    fontSize: "120%",
  };
  const inactiveLink = {
    color: "white",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setHost(user);

    if (user) {
      hubConnection = new HubConnectionBuilder()
        .withUrl("https://your-signalr-hub-url")
        .build();

      hubConnection.start().then(() => {
        hubConnection.invoke("AddUserToGroup", user);
      }).catch(err => console.error(err));
    }

    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, []);

  function handleLogout() {
    const user = localStorage.getItem("user");
    if (hubConnection) {
      hubConnection.invoke("RemoveUserFromGroup", user).then(() => {
        hubConnection.stop();
        localStorage.clear();
        navigate("/login");
      }).catch(err => console.error(err));
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }

  return (
    <div className="h-auto p-0 w-100">
      <nav className="h-auto m-0 rounded-top navbar navbar-expand-lg navbar-primary bg-primary">
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
          <ul className="ms-auto navbar-nav align-items-center me-2">
            {!host && (
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
            {!host && (
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
            {!host && (
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
            {host && (
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
    </div>
  );
}

export default NavigationBar;
