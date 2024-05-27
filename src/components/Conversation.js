import React, { useState } from "react";
import Convo from "./Convo";
import Footer from "./Footer";
import Header from "./Header";
import { set } from "react-hook-form";

function Conversation({ setShow, setMessage, person, showPerson, allMessages, setAllMessages,allGMessages,setAllGMessages
  , grpperson, showGrpPerson}) {
  const [search, setSearch] = useState("");
  const [prevMessages, setPrevMessages] = useState([]);
  const [finalmsg,setFinalMsg]=useState([]);
  return (
    <>
      <Header person={person} showPerson={showPerson} setSearch={setSearch} grpperson={grpperson} showGrpPerson={showGrpPerson} />
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

        grpperson={grpperson} 
        showGrpPerson={showGrpPerson}
        finalmsg={finalmsg}
        setFinalMsg={setFinalMsg}
      />
      <Footer person={person} prevMessages={prevMessages} setPrevMessages={setPrevMessages} allMessages={allMessages}
        setAllMessages={setAllMessages} allGMessages={allGMessages}
        setAllGMessages={setAllGMessages} finalmsg={finalmsg} setFinalMsg={setFinalMsg}/>
    </>
  );
}

export default Conversation;
