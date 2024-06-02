  import React, { useEffect, useState } from "react";
  import Convo from "./Convo";
  import Footer from "./Footer";
  import Header from "./Header";
  import { set } from "react-hook-form";

  function Conversation({ setShow, setMessage, person, showPerson, allMessages, setAllMessages,allGMessages,setAllGMessages,un,setUN,freshgrp,setFreshGrp
    , grpperson, showGrpPerson,selectedGroup,
    setSelectedGroup}) {
    const [search, setSearch] = useState("");
    const [prevMessages, setPrevMessages] = useState([]);
    const [finalmsg,setFinalMsg]=useState([]);
    //const [freshgrp,setFreshGrp]=useState({})
    // useEffect(()=>{
    //   const abc=async()=> {
    //     const fornow=finalmsg.messages; 
    //     if(Array.isArray(fornow)){
    //       const newMessagesByDate = {};
    //       fornow.forEach((msg) => {
    //       const date = new Date(msg.timestamp).toISOString().split('T')[0]
    //       if (!newMessagesByDate[date]) {
    //         newMessagesByDate[date] = [];
    //       }      
    //       newMessagesByDate[date].push(msg);
    //     });  
    //     setFreshGrp(newMessagesByDate);
    //   }else{
    //     console.log("oyy not array dude")
    //   }
    //   console.log("changed atl one",allGMessages,freshgrp)
    //   }
    //   abc()
    // },[finalmsg])
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
          un={un}
          setUN={setUN}
          freshgrp={freshgrp}
          setFreshGrp={setFreshGrp}
          grpperson={grpperson} 
          showGrpPerson={showGrpPerson}
          finalmsg={finalmsg}
          setFinalMsg={setFinalMsg}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <Footer person={person} grpperson={grpperson} prevMessages={prevMessages} setPrevMessages={setPrevMessages} allMessages={allMessages}
          setAllMessages={setAllMessages} allGMessages={allGMessages}
          setAllGMessages={setAllGMessages} finalmsg={finalmsg} setFinalMsg={setFinalMsg}/>
      </>
    );
  }

  export default Conversation;
