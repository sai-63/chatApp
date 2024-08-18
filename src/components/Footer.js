import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { createElement, useEffect, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { AiOutlineSend } from "react-icons/ai";
import { BsEmojiSunglasses } from "react-icons/bs";
import { GrAttachment } from "react-icons/gr";
import SignalRService from './SignalRService';

function Footer({ person, messageObj, setMessageObj, prevMessages, setPrevMessages, allMessages, setAllMessages, replyObject, setReplyObject }) {
  let { handleSubmit } = useForm();
  const host = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);
  let data = {};
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  function generateUUID() {
    // Generate a random UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function encrypt(message, userid) {
    let encryptedMessage = '';
    for (let i = 0; i < message.length; i++) {
        // XOR each character of the message with a character from the userid
        let charCode = message.charCodeAt(i) ^ userid.charCodeAt(i % userid.length);
        encryptedMessage += String.fromCharCode(charCode);
    }
    return encryptedMessage;
}

    async function submitMessage() {
    setSpin(true);
    value = value.trimStart();
    const replyToMessageId = replyObject.replyToMessageId === undefined ? null : replyObject.messageId;
    const messageId = generateUUID();
    const timestamp = new Date().toISOString();
    const formData = new FormData();
    const encryptmessage = encrypt(value,host);
    formData.append('SenderId', host);
    formData.append('ReceiverId', person.id);
    formData.append('Message', encryptmessage);
    formData.append('MessageId', messageId);
    formData.append('Timestamp', timestamp);
    formData.append('ReplyToMessageId', replyToMessageId);

    let data = {
      messageId: messageId,
      senderId: host,
      receiverId: person.id,
      message: encryptmessage,
      isRead: false,
      senderRemoved: false,
      timestamp: timestamp,
      replyToMessageId: replyToMessageId,
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
        })
        .catch((error) => {
          console.log(error);
        });
      console.log(host, " is sending to the Person.id:", person.id);
      console.log("Hiiiiiiiiiiiiiiiiii gsdvhgasssssssddddddf");
      SignalRService.sendMessage(host, data, person.id, username,person.username); // Send message via SignalR
      SignalRService.incrementUnseenMessages(person.id, username);
      SignalRService.sortChats(person.id, username, timestamp);
      SignalRService.sortChats(host, person.username, timestamp);
      setDisabled(false);
      setReplyObject({});
    }
  }

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let typingTimeout;
    
    if (isTyping) {
      SignalRService.userTyping(person.id, username, "typing...");
    } else if (value.length === 0) {
      SignalRService.userTyping(person.id, username, "Online");
    }

    if (isTyping) {
      // Set a timeout to check if user has stopped typing
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 1000); // Adjust timeout duration as needed
    }

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [isTyping, value, person.id, username]);

  const handleChange = (event) => {
    const inputValue = event.target.value;
    setValue(inputValue);

    if (!isTyping) {
      setIsTyping(true);
    }
  };
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
