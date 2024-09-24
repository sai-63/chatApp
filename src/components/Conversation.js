import React, { useState,useEffect } from "react";
import Convo from "./Convo";
import Footer from "./Footer";
import Header from "./Header";
import { set } from "react-hook-form";

function Conversation({ setShow, setMessage, person, showPerson, allMessages, setAllMessages,allGMessages,setAllGMessages
  ,un,setUN,freshgrp,setFreshGrp, grpperson, showGrpPerson,selectedGroup,
  setSelectedGroup,allGro,setAllGro,profilenickname,setProfileNickName}) {
  const [search, setSearch] = useState("");
  const [prevMessages, setPrevMessages] = useState([]);
  const [replyObject , setReplyObject] = useState({});
  const [finalmsg,setFinalMsg]=useState([]);
  return (
    <>
      <Header person={person} showPerson={showPerson} setSearch={setSearch} grpperson={grpperson} showGrpPerson={showGrpPerson} 
        profilenickname={profilenickname} setProfileNickName={setProfileNickName} />
      <Convo
        person={person}
        setShow={setShow}
        setMessage={setMessage}
        search={search}
        prevMessages={prevMessages}
        setPrevMessages={setPrevMessages}
        allMessages={allMessages}
        setAllMessages={setAllMessages}
        allGMessages={allGMessages}
        setAllGMessages={setAllGMessages}
        un={un}
        setUN={setUN}
        freshgrp={freshgrp}
        setFreshGrp={setFreshGrp}
        grpperson={grpperson} 
        showGrpPerson={showGrpPerson}
        replyObject={replyObject}
        setReplyObject={setReplyObject}
        allGro={allGro}
        setAllGro={setAllGro}
        finalmsg={finalmsg}
        setFinalMsg={setFinalMsg}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        profilenickname={profilenickname}
        setProfileNickName={setProfileNickName}

      />
      <Footer person={person} grpperson={grpperson} prevMessages={prevMessages} setPrevMessages={setPrevMessages} allMessages={allMessages}
        setAllMessages={setAllMessages} replyObject={replyObject} setReplyObject={setReplyObject} allGMessages={allGMessages}
        setAllGMessages={setAllGMessages} finalmsg={finalmsg} setFinalMsg={setFinalMsg} />
    </>
  );
}

export default Conversation;
