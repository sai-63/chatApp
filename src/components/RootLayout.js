import React from "react";
import NavigationBar from "./NavigationBar";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    /*<div
      className="container p-0 d-flex flex-column vh-100 pt-2 pb-2 rounded" style={{ position: "relative" }}
    >
      <div
        className="rounded-top w-100"
        style={{ position: "absolute", zIndex: "1", height: "10%" }}
      >
        <NavigationBar />
      </div>
      <div
        className="d-flex rounded-bottom mt-auto shadow"
        style={{ height: "90%", backgroundColor: "#f1f2f6" }}
      >
        <Outlet />
      </div>
    </div>*/
    <div className="container-fluid p-0 d-flex flex-column vh-100 m-0" style={{ position: "relative", backgroundColor: "#232d36" }}>
      <div className="w-100" style={{ position: "absolute", zIndex: "1", height: "9%" }}>
        <NavigationBar />
      </div>
      <div className="d-flex mt-auto shadow" style={{ height: "90%", backgroundColor: "#181f26", color: "#ffffff" }}>
        <Outlet />
      </div>
    </div>



  );
}

export default RootLayout;
