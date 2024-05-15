import React, { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { AiOutlineSearch, AiOutlineCloseCircle } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import socket from "./socket";
import { useEffect } from "react";

function Header({ person, showPerson, setSearch,grpperson,showGrpPerson,isuser,showIsUser,isgrp,showIsGrp }) {
  const [iconActive, setIconActive] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(null);
  const [host, setHost] = useState("");

  //For checking the values of isuser and isgrp 
  useEffect(()=>{
    console.log("At first header we have isuser and isgrp as  ",isuser,isgrp)
  },[])

  //To change the header value acc to isuer and isgrp
  let [fstate,setFState]=useState(true);
  useEffect(()=>{
    setFState(!fstate)
    console.log("In heade we have isuser isgrp for 1st as",isgrp,isuser);
  },[isuser,isgrp])

  // socket.on("allusers", (allUsers) => {
  //   setOnlineUsers(allUsers);
  // });

  // socket.on("typing", (data) => {
  //   setTyping(data);

  

  
  // });

  // socket.on("not-typing", (data) => {
  //   setTyping(null);
  // });

  // useEffect(() => {
  //   socket.emit("reload");
  //   const host = localStorage.getItem("user");
  //   setHost(host);
  // }, []);

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
          {console.log("super man we have isgrp and grpperson  ",isgrp,grpperson)}
          {console.log("super man we have isuser and person",isuser,person)}
          {person.username && !fstate? 
            (person.username?.charAt(0).toUpperCase() +
              person.username?.slice(1)):
            grpperson.name?.charAt(0).toUpperCase() +grpperson.name?.slice(1)
          }
          </span>
          
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
                name=""
                id=""
                className="form-control"
                placeholder="Search Chat..."
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
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
