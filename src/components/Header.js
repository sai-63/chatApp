import React, { useState, useEffect } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { AiOutlineSearch, AiOutlineCloseCircle } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import SignalRService from "./SignalRService";
import socket from "./socket";

function Header({ person, showPerson, setSearch }) {
  const [iconActive, setIconActive] = useState(true);
  const [typing, setTyping] = useState(null);
  const [userState, setUserState] = useState(person.isOnline ? "Online" : "Offline");

  useEffect(() => {
    setUserState(person.isOnline ? "Online" : "Offline");
  }, [person.isOnline]);

  useEffect(() => {
    const handleTyping = (data) => {
      setTyping(data);
    };
    
    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  }, []);

  useEffect(() => {
    const handleDisplayOnline = (username) => {
      console.log("handle display online is working..........");
      if (username === person.username) {
        showPerson(prevPerson => ({ ...prevPerson, isOnline: true }));
      }
    };

    SignalRService.setDisplayOnlineCallback(handleDisplayOnline);

    const handleDisplayOffline = (username) => {
      console.log("handle display offline is working..........");
      if (username === person.username) {
        showPerson(prevPerson => ({ ...prevPerson, isOnline: false }));
      }
    };

    SignalRService.setDisplayOfflineCallback(handleDisplayOffline);

  }, [person.username, showPerson]);

  return (
    <div
      className="d-flex p-2 ps-3 bg-dark bg-opacity-25 justify-content-center align-items-center rounded-top"
      style={{ height: "8%" }}
    >
      <div className="d-flex align-items-center">
        <BiArrowBack
          onClick={() => showPerson({})}
          className=""
          style={{ cursor: "pointer" }}
        />
        <div className="ms-4 p-0">
          <span className="fs-5 p-0 m-0">
            {person.username?.charAt(0).toUpperCase() + person.username?.slice(1)}
          </span>
          <p>{userState}</p>
        </div>
      </div>
      <div className="ms-auto">
        <OverlayTrigger
          trigger={"click"}
          key={"top"}
          placement={"bottom-end"}
          overlay={
            <Popover>
              <input
                type="text"
                className="form-control"
                placeholder="Search Chat..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </Popover>
          }
        >
          <div className="btn p-0 m-0">
            {iconActive ? (
              <AiOutlineSearch
                onClick={() => setIconActive(!iconActive)}
                style={{ cursor: "pointer" }}
                className="fs-4 ms-1 text-light"
              />
            ) : (
              <AiOutlineCloseCircle
                onClick={() => {
                  setIconActive(!iconActive);
                  setSearch("");
                }}
                style={{ cursor: "pointer" }}
                className="fs-4 ms-1 text-light"
              />
            )}
          </div>
        </OverlayTrigger>
        <FiMoreVertical className="m-2 fs-5" />
      </div>
    </div>
  );
}

export default Header;
