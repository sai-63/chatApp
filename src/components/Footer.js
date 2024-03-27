import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { createElement, useEffect, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { useForm } from "react-hook-form";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSunglasses } from "react-icons/bs";
import { GiCancel } from "react-icons/gi";
import { GrAttachment } from "react-icons/gr";
import socket from "./socket";
import SignalRService from './SignalRService';

function Footer({ person }) {
  let { handleSubmit } = useForm();
  let [host, setHost] = useState("");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  useEffect(() => {
    // Initialize SignalR connection when the component mounts
    SignalRService.startConnection();
    setHost(localStorage.getItem("userId"));
    // Set up callback to handle received messages
    SignalRService.setReceiveMessageCallback(({ user, message }) => {
      setChatMessages(prevMessages => [...prevMessages, { senderId: user, message }]);
    });

    // Fetch chat messages from the database on component mount
    axios.get('http://localhost:5290/Chat/Get All Messages')
      .then((res) => {
        console.log("Chat messages:", res.data);
        setChatMessages(res.data); // Assuming res.data is an array of chat messages
      })
      .catch((error) => {
        console.error("Error fetching chat messages:", error);
      });
  }, []);

  function submitMessage() {
    setSpin(true);
    value = value.trimStart();
    const data = {
      senderId:host,
      receiverId:person.id,
      message: value,
      timestamp: Date.now()
    }
    if (value.length!==0) {
      axios.post('http://localhost:5290/Chat/Send Message', data)
        .then((res) => {
          setValue("");
          setSpin(false);
          alert('Message successfully sent');
          console.log(res.data);
          console.log(host)
          setMessage('');
        })
        .catch((error) => {
          console.log(error);
        })
      SignalRService.sendMessage(host, message); // Send message via SignalR
    }
    
  }
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleUserChange = (event) => {
    setUser(event.target.value);
  };
  function handleChange(event) {
    setValue(event.target.value);
  }


  


  

  
  return (
    <form
      className="footer d-flex align-items-center justify-content-center bg-dark bg-opacity-10"
      style={{ height: "10%" }}
      onSubmit={handleSubmit(submitMessage)}
    >
      <div className="emojiAndFile mt-1 ms-4 d-flex">
        <OverlayTrigger  trigger={"click"}  key={"top"}  placement={"top"}  rootClose={true}
          overlay={
            <Popover>
              <EmojiPicker  />
            </Popover>
          }
        >
          <div className="btn p-0 m-0  border-none">
            <BsEmojiSunglasses
              style={{ cursor: "pointer" }}
              className="fs-4 ms-1 text-light"
            />
          </div>
        </OverlayTrigger>

        <OverlayTrigger trigger={"click"} key={"top"} placement={"top-start"}
          rootClose={true}
          overlay={
            <Popover className="d-block">
              <input type="file" />
            </Popover>
          }
        >
          <div className="">
            <GrAttachment
              style={{ cursor: "pointer" }}
              className="fs-4 ms-1 text-light"
            />
          </div>
        </OverlayTrigger>
      </div>


      <div className="border w-75 ms-3">
        <input
          type="text"
          className="fs-6 ps-2 pt-1 pb-1 mt-2 w-100 rounded"
          style={{ wordBreak: "break-word" }}
          placeholder="Type a Message..."
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
      
          <Button
            className="btn btn-success pt-0 pb-1 mt-2 ms-2"
            onClick={submitMessage}
          >
            <AiOutlineSend className="fs-6" />
          </Button>
        
            
        
        
  
    </form>
  );
}

export default Footer;
