import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import {
  AiFillFileExcel,
  AiFillFileImage,
  AiFillFilePdf,
  AiFillFilePpt,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileWord,
  AiFillFileZip,
} from "react-icons/ai";
import { BsChevronDoubleDown } from "react-icons/bs";
import { IoMdDownload } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import * as signalR from "@microsoft/signalr";
import axios from "axios"; // Import Axios

function Convo({ person, setShow, setMessage, search }) {
  const [messages, setMessages] = useState([]);
  const [host, setHost] = useState("");
  const [isLoaded, setIsLoaded] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteObject, setDeleteObject] = useState({});
  const [state, setState] = useState(true);
  const [scroll, setScroll] = useState(false);

  function handleClose() {
    setShowModal(false);
    setDeleteObject({});
  }

  const scrollRef = useRef(null);

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    setHost(localStorage.getItem("user"));

    let hosting = localStorage.getItem("user");

    axios
      .post("https://chtvthme.onrender.com/conversation-api/get-messages", {
        host: hosting,
        person: person.userid,
      })
      .then((response) => {
        setMessages(
          response.data.chat.filter(
            (obj) =>
              obj.message?.toLowerCase().includes(search.toLowerCase()) ||
              obj.fileName?.toLowerCase().includes(search.toLowerCase())
          )
        );
        setShow(false);
        setMessage("");
        setIsLoaded(false);
        setScroll(!scroll);
      })
      .catch((err) => console.log(err.message));
  }, [person, search, state]);

  useEffect(() => {
    setIsLoaded(true);
  }, [person]);

  useEffect(() => {
    scrollDown();
  }, [scroll]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("your_signalR_hub_url")
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.start().then(() => {
      console.log("SignalR Connected");
    }).catch((err) => console.error(err.toString()));

    connection.on("ReceiveMessage", (message) => {
      // Handle received message
      console.log("Received Message:", message);
      // Assuming message contains the new message object, update state accordingly
      setMessages([...messages, message]);
    });

    connection.on("DeleteMessage", (messageId) => {
      // Handle deleted message
      console.log("Deleted Message ID:", messageId);
      // Remove the deleted message from the state
      setMessages(messages.filter(msg => msg.id !== messageId));
    });

    return () => {
      connection.stop().then(() => {
        console.log("SignalR Connection Stopped");
      }).catch((err) => console.error(err.toString()));
    };
  }, [host, state]);

  const handleDownload = async (obj) => {
    try {
      let response = await axios.post(
        "https://chtvthme.onrender.com/conversation-api/download-file",
        obj,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", obj.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShow(true);
      setMessage("File Downloaded Successfully..");
    } catch (err) {
      setShow(true);
      setMessage("Error while downloading the file..");
    }
  };

  function handleModal(obj) {
    setShowModal(true);
    setDeleteObject(obj);
  }

  function handleDelete() {
    handleClose();
    axios
      .post(
        "https://chtvthme.onrender.com/conversation-api/delete-message",
        deleteObject
      )
      .then((res) => {
        setMessage(res.data.message);
        // No need for socket here as it's replaced with SignalR
      })
      .catch((err) => {
        setMessage(err.message);
        setDeleteObject({});
      });
  }

  if (isLoaded) {
    return (
      <div className="bg-white d-flex" style={{ height: "82%" }}>
        <Spinner className="m-auto" animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-white h-100"
      >
        {messages.length !== 0 ? (
          <div className="mt-auto">
            {messages.map((obj) =>
              obj.senderId === host ? (
                <div
                  className="ms-auto pe-3 mb-1 d-flex"
                  style={{ width: "60%", wordBreak: "break-word" }}
                  key={obj.id}
                >
                  {/* Render sender messages */}
                </div>
              ) : (
                <div
                  className="ps-2 mb-1"
                  style={{ width: "60%", wordBreak: "break-word" }}
                  key={obj.id}
                >
                  {/* Render receiver messages */}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="lead text-secondary m-auto"> Chat is Empty </p>
        )}
      </div>

      <BsChevronDoubleDown
        className="bg-secondary text-white p-1 btn fs-5"
        onClick={() => setScroll(!scroll)}
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "1rem",
          cursor: "pointer",
          borderRadius: "50%",
        }}
      />

      {/* Modal for Delete */}

      <Modal centered size="sm" show={showModal} onHide={handleClose}>
        <Modal.Body>
          {`Do you want to Delete this Message..
        
          ${
            deleteObject.message ? deleteObject.message : deleteObject.fileName
          }`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleDelete}>
            Yes, Proceed.
          </Button>
          <Button variant="danger" onClick={handleClose}>
            No, Wait..
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Convo;
