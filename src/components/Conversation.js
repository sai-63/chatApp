import React, { useState } from "react";
import Convo from "./Convo";
import Footer from "./Footer";
import Header from "./Header";
import { set } from "react-hook-form";

function Conversation({ setShow, setMessage, person, showPerson ,grpperson,showGrpPerson,isuser,showIsUser,isgrp,showIsGrp,grpmsgs,setGrpMsgs}) {
  const [search, setSearch] = useState("");
  const [prevMessages, setPrevMessages] = useState([]);
  const [finalmsg,setFinalMsg]=useState([]);
  return (
    <>
      <Header person={person} showPerson={showPerson} setSearch={setSearch} 
      grpperson={grpperson} showGrpPerson={showGrpPerson} isuser={isuser} showIsUser={showIsUser} isgrp={isgrp} showIsGrp={showIsGrp} />
      <Convo
        person={person}
        setShow={setShow}
        setMessage={setMessage}
        search={search}
        prevMessages={prevMessages}
        setPrevMessages={setPrevMessages}
        showPerson={showPerson}
        grpperson={grpperson}
        showGrpPerson={showGrpPerson}
        finalmsg={finalmsg}
        setFinalMsg={setFinalMsg}
        isuser={isuser}
        showIsUser={showIsUser}
        isgrp={isgrp}
        showIsGrp={showIsGrp}
      />
      <Footer person={person} grpperson={grpperson} prevMessages={prevMessages} setPrevMessages={setPrevMessages} finalmsg={finalmsg} setFinalMsg={setFinalMsg}/>
    </>
  );
}

export default Conversation;
