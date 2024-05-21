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

function Footer({ person ,prevMessages , setPrevMessages}) {
  let { handleSubmit } = useForm();
  let [host, setHost] = useState("");
  let [receiver,setReciever] = useState("");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  
  useEffect(()=>{
    localStorage.setItem("reciever",person.id);
    startConnection();
  },[person,prevMessages]);

  function startConnection() {

    console.log("HI");
    SignalRService.startConnection();
    console.log("Reached");
    setHost(localStorage.getItem("userId"));
    SignalRService.setReceiveMessageCallback(({ user, message }) => {
      setPrevMessages(prevMessages => [...prevMessages, { senderId: user, message: message , recieverId: person.id}]);
    });
    // console.log("Prev in signalR:",prevMessages);
    // console.log("Bye");

  }

  function submitMessage() {
    setSpin(true);
    value = value.trimStart();
    /*const data = {
      senderId:host,
      receiverId:person.id,
      message: value,
      timestamp: Date.now()
    }*/
    //console.log(data);
    const formData = new FormData();
    formData.append('SenderId',host);
    formData.append('ReceiverId',person.id);
    formData.append('Message',value);
    /*formData.append('FileName',"");
  formData.append('FileType',"");
  formData.append('FileContent',"");
  formData.append('FileSize',"");
  formData.append('Timestamp',Date.now());*/
    
    console.log(host)
    console.log(person.id)
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]); 
    }

    if (file!==null) {
      formData.append("File",file);
    }
    if (value.length!==0) {
      axios.post('http://localhost:5290/Chat/Send Message',  formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((res) => {
          setValue("");
          setSpin(false);
          alert('Message successfully sent');
          console.log(res.data);
          console.log(host);
          setPrevMessages([
            ...prevMessages,res.data
           // {
             // senderId: host,
              //receiverId: person.id,
              //message: value,
              //fileName: file ? file.name : null,
              // Add other file details if needed
            //},
          ]);
          //setPrevMessages([...prevMessages, data]);
          // console.log(prevMessages,data);
          // console.log([...prevMessages,data])
          // console.log("Prev in footer",prevMessages);
        })
        .catch((error) => {
          console.log(error);
        })
      console.log("Person.id:",person.id);
      SignalRService.sendMessage(host, value, host);
      SignalRService.sendMessage(host, value, person.id); // Send message via SignalR
    }
    
  }

  useEffect(()=>{
    // console.log("Prev messages changed in footer :",prevMessages);
  },[prevMessages]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleUserChange = (event) => {
    setUser(event.target.value);
  };
  function handleChange(event) {
    setValue(event.target.value);
  }
  function handleEmoji(emoji) {
    setValue(value + emoji.emoji);
  }
  function handleFile(event) {
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);
    setValue(event.target.files[0].name);
    setDisabled(true);
  }
  function submitFile() {
    let obj = {};
    setSpin(true);

    obj.senderId = host;
    obj.receiverId = person.id;
    obj.timestamp = Date.now()

    obj.fileName = file.name;

    //obj.bfile = bFile;

    let fd = new FormData();

    fd.append("details", JSON.stringify(obj));

    fd.append("file", file);

    axios
      .post("https://chtvthme.onrender.com/conversation-api/send-file", fd)
      .then((res) => {
        setValue("");
        setSpin(false);
        setDisabled(false);
        const socketObj = {};
        socketObj.senderId = host;
        socketObj.receiverId = person.userid;
        socket.emit("message-sent", socketObj);
      })
      .catch((err) => console.log(err.message));
  }

  function cancelFile() {
    setValue("");
    setDisabled(false);
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
              <EmojiPicker onEmojiClick={handleEmoji} />
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
              <input type="file" onInput={handleFile} />
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
