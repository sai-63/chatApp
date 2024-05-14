import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AllChats from "./AllChats";
import Convo from "./Convo";
import Conversation from "./Conversation";
import EmptyChat from "./EmptyChat";

function Chat() {
  let [person, showPerson] = useState({});
  let [grpperson,showGrpPerson]=useState({});
  let [isuser,showIsUser]=useState(true);
  let [isgrp,showIsGrp]=useState(true);  

  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [message, setMessage] = useState("");
  let [grpmsgs,setGrpMsgs]=useState([]);

  return (
    <div className="web dark row flex-grow-1 m-0 mt-3" style={{ position: "relative" }}>
      <div
        className={`col col-md-4 ${
          person.id ? "d-none" : "d-block"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        <AllChats
          show={show}
          setShow={setShow}
          message={message}
          setMessage={setMessage}
          showPerson={showPerson}
          showGrpPerson={showGrpPerson}
          isgrp={isgrp}
          showIsGrp={showIsGrp}
          isuser={isuser}
          showIsUser={showIsUser}
          grpmsgs={grpmsgs}
          setGrpMsgs={setGrpMsgs}
        />
      </div>
      <div
        className={`col col-md-8 ${
          person.userid ? "d-block" : "d-none"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        {/* console.log("In Chat JS We have person as",person) */}
        {(person.id || grpperson.id) ? (
          <Conversation
            setShow={setShow}
            setMessage={setMessage}
            person={person}
            showPerson={showPerson}
            grpperson={grpperson}
            showGrpPerson={showGrpPerson}
            isuser={isuser}
            showIsUser={showIsUser}
            isgrp={isgrp}
            showIsGrp={showIsGrp}
            grpmsgs={grpmsgs}
            setGrpMsgs={setGrpMsgs}           
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default Chat;
