import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AllChats from "./AllChats";
import Conversation from "./Conversation";
import EmptyChat from "./EmptyChat";

function Chat() {
  let [person, showPerson] = useState({});

  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [message, setMessage] = useState("");

  //To check it is user or group
  let [isuser,showIsUser]=useState(true);
  let [isgrp,showIsGrp]=useState(true);  
  //To get group object
  let [grpperson,showGrpPerson]=useState({});

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
        />
      </div>

      <div
        className={`col col-md-8 ${
          person.userid ? "d-block" : "d-none"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        {(person.id || grpperson.id)? (
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
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default Chat;
