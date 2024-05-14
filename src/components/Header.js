import React, { useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { AiOutlineSearch, AiOutlineCloseCircle } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import socket from "./socket";
import { useEffect } from "react";
import axios from "axios";
import AllChats from "./AllChats";
import {bothfea} from './AllChats';

function Header({ person, showPerson, setSearch,grpperson,showGrpPerson,isuser,showIsUser,isgrp,showIsGrp}) {
  const [iconActive, setIconActive] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(null);
  const [host, setHost] = useState("");
  let [fstate,setFState]=useState(true);
  useEffect(()=>{
    console.log("At first header we have isuser and isgrp as  ",isuser,isgrp)
  },[])

  socket.on("allusers", (allUsers) => {
    setOnlineUsers(allUsers);
  });

  socket.on("typing", (data) => {
    setTyping(data);
  });

  socket.on("not-typing", (data) => {
    setTyping(null);
  });

  useEffect(() => {
    socket.emit("reload");
    const host = localStorage.getItem("user");
    setHost(host);
  }, []);
  useEffect(()=>{
    setFState(!fstate)
  },[isuser,isgrp])
  // useEffect(()=>{
  //   showIsUser(!isgrp);
  // },[isuser])
  // useEffect(()=>{
  //   showIsUser(!isuser)
  // },[isuser])
  // useEffect(()=>{
  //   if(isuser&&isgrp){
  //     console.log("ayyababoi rondu okkate");
  //     return ;
  //   }
  //   if(isgrp&& !isuser){
  //     showIsUser(false);
  //     showIsGrp(true);
  //     console.log("Header user called and got group as & side case ",isuser,isgrp)
  //   }else if (isuser&&!isgrp){
  //     showIsUser(true);
  //     showIsGrp(false);
  //     console.log("Header group called and got user as & side case ",isgrp,isuser)
  //   }
  // },[isuser,isgrp])
  // useEffect(()=>{
  //   // if(isgrp){showIsGrp(false)}
  //   // showIsUser(!isuser)
  //   if(isgrp){
  //     showIsUser(!isuser)
  //     console.log("Header user called and got value as & side case ",isuser,isgrp)
  //   }
    
  // },[])
  // useEffect(()=>{
  //   if(isuser){
  //     showIsUser(!isuser);
  //     console.log("Header group called and got value as & side case ",isgrp,isuser)
  //   }
  //   // showIsGrp(!isgrp)    
  // },[])
  // useEffect(()=>[
  //   console.log("Finally have user and group as  ",isuser,isgrp)
  // ],[])

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
            {/* Now  {person.username && !isuser?   */}
            {console.log("super man we have isuser and isgrp && fstate as  ",isuser,isgrp,fstate)}
          {person.username && !fstate?  
          (person.username?.charAt(0).toUpperCase() +person.username?.slice(1)):
          grpperson.name?.charAt(0).toUpperCase() +grpperson.name?.slice(1)}
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
