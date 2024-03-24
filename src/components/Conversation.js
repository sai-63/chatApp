import React, { useState } from "react";
import Convo from "./Convo";
import Footer from "./Footer";
import Header from "./Header";

function Conversation({ setShow, setMessage, person, showPerson }) {
  const [search, setSearch] = useState("");
  return (
    <>
      <Header person={person} showPerson={showPerson} setSearch={setSearch} />
      <Convo
        person={person}
        setShow={setShow}
        setMessage={setMessage}
        search={search}
      />
      <Footer person={person} />
    </>
  );
}

export default Conversation;
