import React, { useState } from "react";
import Convo from "./Convo";
import Footer from "./Footer";
import Header from "./Header";
import { set } from "react-hook-form";

function Conversation({ setShow, setMessage, person, showPerson, allMessages, setAllMessages }) {
  const [search, setSearch] = useState("");
  const [prevMessages, setPrevMessages] = useState([]);
  const [replyObject , setReplyObject] = useState({});
  return (
    <>
      <Header person={person} showPerson={showPerson} setSearch={setSearch} />
      <Convo
        person={person}
        setShow={setShow}
        setMessage={setMessage}
        search={search}
        prevMessages={prevMessages}
        setPrevMessages={setPrevMessages}
        allMessages={allMessages}
        setAllMessages={setAllMessages}
        replyObject={replyObject}
        setReplyObject={setReplyObject}

      />
      <Footer person={person} prevMessages={prevMessages} setPrevMessages={setPrevMessages} allMessages={allMessages}
        setAllMessages={setAllMessages} replyObject={replyObject} setReplyObject={setReplyObject} />
    </>
  );
}

export default Conversation;
