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

function Footer({ person }) {
  let { handleSubmit } = useForm();
  let [host, setHost] = useState("");
  let [value, setValue] = useState("");
  let [disabled, setDisabled] = useState(false);
  let [file, setFile] = useState(null);
  let [spin, setSpin] = useState(false);

  function submitMessage() {
    setSpin(true);
    let obj = {};
    value = value.trimStart();

    obj.message = value;
    obj.senderId = host;
    obj.receiverId = person.userid;

    let today = new Date();

    let hrs = today.getHours().toString();
    if (hrs.length === 1) hrs = "0".concat(hrs);

    let mins = today.getMinutes().toString();
    if (mins.length === 1) mins = "0".concat(mins);

    let secs = today.getSeconds().toString();
    if (secs.length === 1) secs = "0".concat(secs);

    obj.time = hrs + ":" + mins + ":" + secs;

    if (value.length !== 0) {
      axios
        .post(
          "https://chtvthme.onrender.com/conversation-api/send-message",
          obj
        )
        .then((res) => {
          setValue("");
          setSpin(false);
          const socketObj = {};
          socketObj.senderId = host;
          socketObj.receiverId = person.userid;
          socket.emit("message-sent", socketObj);
        })
        .catch((err) => console.log(err.message));
    } else {
      setValue("");
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

  function submitFile() {
    let obj = {};
    setSpin(true);

    obj.senderId = host;
    obj.receiverId = person.userid;

    let today = new Date();

    let hrs = today.getHours().toString();
    if (hrs.length === 1) hrs = "0".concat(hrs);

    let mins = today.getMinutes().toString();
    if (mins.length === 1) mins = "0".concat(mins);

    let secs = today.getSeconds().toString();
    if (secs.length === 1) secs = "0".concat(secs);

    obj.time = hrs + ":" + mins + ":" + secs;

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

  useEffect(() => {
    const socketObj = {};
    socketObj.senderId = host;
    socketObj.receiverId = person.userid;
    if (value.length !== 0) {
      socket.emit("typing", socketObj);
    } else {
      socket.emit("not-typing", socketObj);
    }
  }, [value]);

  useEffect(() => {
    setHost(localStorage.getItem("user"));
  }, []);
  return (
    <form
      className="footer d-flex align-items-center justify-content-center bg-dark bg-opacity-10"
      style={{ height: "10%" }}
      onSubmit={handleSubmit(submitMessage)}
    >
      <div className="emojiAndFile mt-1 ms-4 d-flex">
        <OverlayTrigger
          trigger={"click"}
          key={"top"}
          placement={"top"}
          rootClose={true}
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

        <OverlayTrigger
          trigger={"click"}
          key={"top"}
          placement={"top-start"}
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
      {disabled === false ? (
        spin ? (
          <Button className="btn btn-success pt-0 pb-1 mt-2 ms-2" disabled>
            <Spinner animation="border" variant="dark" size="sm" />
          </Button>
        ) : (
          <Button
            className="btn btn-success pt-0 pb-1 mt-2 ms-2"
            onClick={submitMessage}
          >
            <AiOutlineSend className="fs-6" />
          </Button>
        )
      ) : (
        <>
          {spin ? (
            <Button className="btn btn-success pt-0 pb-1 mt-2 ms-2" disabled>
              <Spinner animation="border" variant="dark" size="sm" />
            </Button>
          ) : (
            <>
              <Button
                className="btn btn-success pt-0 pb-1 mt-2 ms-2"
                onClick={submitFile}
              >
                <AiOutlineSend className="fs-6" />
              </Button>
              <Button
                className="btn btn-secondary pt-0 pb-1 mt-2 ms-2"
                onClick={cancelFile}
              >
                <GiCancel className="fs-6" />
              </Button>
            </>
          )}
        </>
      )}
    </form>
  );
}

export default Footer;
