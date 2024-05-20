import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { createElement, useEffect, useState ,useContext} from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { useForm } from "react-hook-form";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSunglasses } from "react-icons/bs";
import { GiCancel } from "react-icons/gi";
import { GrAttachment } from "react-icons/gr";
import socket from "./socket";
import SignalRService from './SignalRService';
import { UserContext } from "./UserContext";

function Footer({ person ,grpperson,messageObj, setMessageObj, prevMessages , setPrevMessages,finalmsg,setFinalMsg}) {
  let { handleSubmit } = useForm();
  let [host, setHost] = useState("");
  let [receiver,setReciever] = useState("");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);
  let data = {};
  let dataa={}
  const [message, setMessage] = useState('');
  const [userr, setUserr] = useState('');
  const { user, setUser } = useContext(UserContext);
  
  useEffect(()=>{
    if(person.id!=null){
      localStorage.setItem("reciever",person.id);
    }else{
      localStorage.setItem("reciever",grpperson.id);
    }
    startConnection();
  },[person]);

  useEffect(() => {
    SignalRService.setReceiveMessageCallback((chat) => {
      const chatDate = new Date(chat.timestamp).toISOString().split('T')[0]; // Extract date from timestamp
      setPrevMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate].push(chat); // Append chat to existing date's messages
        } else {
          updatedMessages[chatDate] = [chat]; // Create a new list for the date if it doesn't exist
        }
        console.log("gone till setrec",updatedMessages)
        return updatedMessages;
      });
    });
  }, []);

  useEffect(() => {
    SignalRService.setReceiveGroupMessageCallback((group) => {
      const chatDate = new Date(group.timestamp).toISOString().split('T')[0]; // Extract date from timestamp
      setFinalMsg(finalmsg => {
        const updatedGrpMessages = { ...finalmsg };
        if (updatedGrpMessages[chatDate]) {
          updatedGrpMessages[chatDate].push(group); // Append chat to existing date's messages
        } else {
          updatedGrpMessages[chatDate] = [group]; // Create a new list for the date if it doesn't exist
        }
        console.log("gone till setrec",updatedGrpMessages)
        return updatedGrpMessages;
      });
    });
  }, []);

  
  // useEffect(() => {
  //   SignalRService.setRemoveMessageCallback((id) => {
  //     // Function to remove the chat with matching messageId
  //     const removeMessage = (messageId) => {
  //       setPrevMessages(prevMessages => prevMessages.filter(message => message.messageId !== messageId));
  //     };
  
  //     // Call the function to remove the message with the provided id
  //     removeMessage(id);
  //   });
  // }, [prevMessages]);

  function startConnection() {

    console.log("HI");
    SignalRService.startConnection();
    console.log("Reached");
    setHost(localStorage.getItem("userId"));
    // console.log("Prev in signalR:",prevMessages);
    // console.log("Bye");

  }

  function generateUUID() {
    // Generate a random UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });    
}
function ggenerateUUID() {
  // Generate a random UUID
  return 'xxxxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return r.toString(16);
  });
}

  function submitMessage() {
    setSpin(true);
    value = value.trimStart();
    if(user.userType==="user"){
    const messageId = generateUUID();
    data = {
      messageId:messageId,
      senderId:host,
      receiverId:person.id,
      message: value,
      timestamp: new Date().toISOString()
    }
    if (value.length!==0) {
      axios.post('http://localhost:5290/Chat/Send Message', data)
        .then((res) => {
          setValue("");
          setSpin(false);
          alert('Message successfully sent');
          console.log(res.data);
          console.log(host);
          setPrevMessages([...prevMessages, data]);
          // console.log(prevMessages,data);
          // console.log([...prevMessages,data])
          // console.log("Prev in footer",prevMessages);
        })
        .catch((error) => {
          console.log(error);
        })
      console.log("Person.id:",person.id);
      // SignalRService.sendMessage(host, data, host);
      SignalRService.sendMessage(host, data, person.id); // Send message via SignalR
    }
    }else{
      console.log("Entered sendgrpmsgs hoho")
    const messageId = ggenerateUUID();
    dataa = {
      senderId:host,
      message: value,
      Timestamp: new Date().toISOString()
      }
    if (value.length!==0) {
      const xy={groupname:grpperson.name,messages:dataa}
      console.log("The one we have left is ",xy,xy.groupname)
      axios.post("http://localhost:5290/Chat/SendGrpMessage?groupname="+grpperson.name,dataa)
        .then((res) => {
          setValue("");
          setSpin(false);
          alert('Grp Message successfully sent');
          console.log(res.data);
          console.log(host);
          setFinalMsg([...finalmsg, dataa]);
          // console.log(prevMessages,data);
          // console.log([...prevMessages,data])
          // console.log("Prev in footer",prevMessages);
        })
        .catch((error) => {
          console.log(error);
        })
      console.log("Grpperson id:",grpperson.id);
      // SignalRService.sendMessage(host, data, host);
      SignalRService.sendMessageToGroup(localStorage.getItem("groupid"),host, dataa); // Send message via SignalR

    }
  }
    
  }

  useEffect(()=>{
    // console.log("Prev messages changed in footer :",prevMessages);
  },[prevMessages]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleUserChange = (event) => {
    setUserr(event.target.value);
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
    if (file) {
        SignalRService.sendFile(file);
    }
  }

  // function submitFile(event){
  //   SignalRService.sendFile(event);
  // }

  // function downloadFile(event){
  //   SignalRService.downloadFile(event);
  // }
  /*function submitFile() {
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
  }*/

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
              <input type="file" id="fileInput" onchange={submitFile} />
              <button onclick={SignalRService.downloadFile}>Download File</button>
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