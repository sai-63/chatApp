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

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .post("https://chtvthme.onrender.com/user-api/pathjump", { token: token })
      .then((res) => {
        if (res.data.success !== true) {
          alert(res.data.message);
          localStorage.clear();
          navigate("/login");
        }
      })
      .catch((err) => alert("Error: " + err.message));
  }, []);

  return (
    <div className="web dark row flex-grow-1 m-0 mt-3" style={{ position: "relative" }}>
      <div
        className={`col col-md-4 ${
          person.userid ? "d-none" : "d-block"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        <AllChats
          show={show}
          setShow={setShow}
          message={message}
          setMessage={setMessage}
          showPerson={showPerson}
        />
      </div>

      <div
        className={`col col-md-8 ${
          person.userid ? "d-block" : "d-none"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        {person.userid ? (
          <Conversation
            setShow={setShow}
            setMessage={setMessage}
            person={person}
            showPerson={showPerson}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default Chat;
