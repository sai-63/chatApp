import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { createElement, useEffect, useState , useContext} from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSunglasses } from "react-icons/bs";
import { GrAttachment } from "react-icons/gr";
import SignalRService from './SignalRService';
import { UserContext } from './UserContext';

function Footer({ person,grpperson, messageObj, setMessageObj, prevMessages, setPrevMessages, allMessages, setAllMessages }) {
  let { handleSubmit } = useForm();
  const host = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);
  let data = {};
  const [message, setMessage] = useState('');
  //const [user, setUser] = useState('');
  const { user, setUser } = useContext(UserContext);

  function generateUUID() {
    // Generate a random UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function ggenerateUUID() {
    // Generate a random UUID
    return 'xxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 24 | 0;
        return r.toString(24);
    });
  }  

  async function submitMessage() {
    if (user.userType=="user") {
      setSpin(true);
      value = value.trimStart();
      const messageId = generateUUID();
      const timestamp = new Date().toISOString();
      const formData = new FormData();
      formData.append('SenderId', host);
      formData.append('ReceiverId', person.id);
      formData.append('Message', value);
      formData.append('MessageId', messageId);
      formData.append('Timestamp', timestamp);
  
      let data = {
        messageId: messageId,
        senderId: host,
        receiverId: person.id,
        message: value,
        isRead: false,
        senderRemoved: false,
        timestamp: timestamp,
        fileContent: null,
        fileName: null,
        fileType: null,
        fileSize: null
      };
  
      console.log(host);
      console.log(person.id);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
  
      if (file !== null) {
        formData.append("File", file);
  
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
            data.fileContent = base64String;
            data.fileName = file.name;
            data.fileType = file.type;
            data.fileSize = file.size;
            resolve(data); // Resolve the promise with updated data
          };
          reader.onerror = function (error) {
            reject(error); // Reject the promise if there's an error
          };
          reader.readAsArrayBuffer(file);
        });
      }
  
      if (value.length !== 0) {
        axios.post('http://localhost:5290/Chat/Send Message', formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((res) => {
            setValue("");
            //   setSpin(false);
            //   alert('Message successfully sent');
            //   const chatDate = new Date(data.timestamp).toISOString().split('T')[0]; // Extract date from timestamp
  
            // // setAllMessages(allMessages => {
            // //   const updatedMessages = { ...allMessages[person.username] };
  
            // //   if (updatedMessages[chatDate]) {
            // //     updatedMessages[chatDate] = [...updatedMessages[chatDate], data]; // Append chat to existing date's messages
            // //   } else {
            // //     updatedMessages[chatDate] = [data]; // Create a new list for the date if it doesn't exist
            // //   }
  
            //   return {
            //     ...allMessages,
            //     [person.username]: updatedMessages
            //   };
            // });
          })
          .catch((error) => {
            console.log(error);
          });
        console.log(host, " is sending to the Person.id:", person.id);
        SignalRService.sendMessage(host, data, person.id); // Send message via SignalR
        SignalRService.incrementUnseenMessages(person.id, username);
        SignalRService.sortChats(person.id, username, timestamp);
        SignalRService.sortChats(host, person.username, timestamp);
        setDisabled(false);
      }
    }else{
      setSpin(true);
      value = value.trimStart();
      const messageId = ggenerateUUID();
      const timestamp = new Date().toISOString();
      const formData = new FormData();
      formData.append('Id', messageId);
      formData.append('SenderId', host);
      formData.append('Message', value);      
      formData.append('Timestamp', timestamp);
  
      let data = {
        Id: messageId,
        SenderId: host,
        Message: value,
        FileName: null,
        FileType: null,
        FileContent: null,
        FileSize: null,             
        Timestamp: timestamp,
        DeletedBy:false,
      };
  
      console.log("host bayya",host);
      console.log("Group Id: Footer- ",grpperson.id);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
  
      if (file !== null) {
        formData.append("File", file);
  
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
            data.fileContent = base64String;
            data.fileName = file.name;
            data.fileType = file.type;
            data.fileSize = file.size;
            resolve(data); // Resolve the promise with updated data
          };
          reader.onerror = function (error) {
            reject(error); // Reject the promise if there's an error
          };
          reader.readAsArrayBuffer(file);
        });
      }
  
      if (value.length !== 0) {
        axios.post(`http://localhost:5290/Chat/SendGrpMessage?groupname=${encodeURIComponent(grpperson.name)}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((res) => {
            setValue("");
          })
          .catch((error) => {
            console.log(error);
          });
        console.log(host, " is sending to the Group.id:", grpperson.id,localStorage.getItem("groupid"),grpperson.name);
        // SignalRService.sendGrpMessage(host, data, localStorage.getItem("currentGroupName"));
        //SignalRService.sendGrpMessage(host, data, localStorage.getItem("groupid"));
        SignalRService.sendGrpMessage(host, data,grpperson.name);
        
        // SignalRService.incrementUnseenMessages(person.id, username);
        //SignalRService.sortChats(person.id, username, timestamp);
        //SignalRService.sortChats(host, person.username, timestamp);
        setDisabled(false);
      }
    }
  }

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

  return (
    <form
      className="footer d-flex align-items-center justify-content-center bg-dark bg-opacity-10"
      style={{ height: "10%" }}
      onSubmit={handleSubmit(submitMessage)}
    >
      <div className="emojiAndFile mt-1 ms-4 d-flex">
        <OverlayTrigger trigger={"click"} key={"top"} placement={"top"} rootClose={true}
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