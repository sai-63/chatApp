import axios from "axios";
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
import socket from "./socket";

function Convo({ person, setShow, setMessage, search }) {
  let [messages, setMessages] = useState();
  let [host, setHost] = useState("");
  let [isLoaded, setIsLoaded] = useState(true);
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

  socket.on("message-sent", (data) => {
    if (data.senderId === host || data.receiverId === host) {
      setState(!state);
    }
  });
  socket.on("delete-message", (data) => {
    if (data.senderId === host || data.receiverId === host) {
      setState(!state);
    }
  });

  useEffect(() => {
    setIsLoaded(true);
  }, [person]);

  useEffect(() => {
    scrollDown();
  }, [scroll]);

  if (isLoaded) {
    return (
      <div className="bg-white d-flex" style={{ height: "82%" }}>
        <Spinner className="m-auto" animation="border" variant="primary" />
      </div>
    );
  }

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
        const socketObj = {};
        socketObj.senderId = host;
        socketObj.receiverId = person.userid;
        socket.emit("delete-message", socketObj);
      })
      .catch((err) => {
        setMessage(err.message);
        setDeleteObject({});
      });
  }

  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-light h-100"
      >
        {messages.length !== 0 ? (
          <div className="mt-auto">
            {messages.map((obj) =>
              obj.senderId === host ? (
                <div
                  className="ms-auto pe-3 mb-1 d-flex"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="d-inline-block ms-auto fs-6 lead m-0 bg-success pt-1 pb-1 rounded text-white"
                    style={{ position: "relative" }}
                  >
                    {obj.message ? (
                      <div
                        className="d-flex flex-wrap ms-2 me-2 mt-1"
                        style={{ position: "relative" }}
                      >
                        <p
                          className="m-0 me-2"
                          style={{ position: "relative" }}
                        >
                          {obj.message}
                        </p>
                        <p
                          className="m-0 mt-auto ms-auto p-0 d-inline"
                          style={{ fontSize: "10px" }}
                        >
                          {obj.time}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="d-flex me-1 ms-1 mt-1"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="d-flex flex-wrap justify-content-between"
                          style={{ position: "relative" }}
                        >
                          <div style={{ position: "relative" }}>
                            {obj.fileType === "application/pdf" ? (
                              <AiFillFilePdf
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("image") ? (
                              <AiFillFileImage
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/vnd") ? (
                              <AiFillFileExcel
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("zip") ? (
                              <AiFillFileZip
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("text/plain") ? (
                              <AiFillFileText
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes(
                                "application/powerpoint"
                              ) ? (
                              <AiFillFilePpt
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/msword") ? (
                              <AiFillFileWord
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : (
                              <AiFillFileUnknown
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            )}
                            <IoMdDownload
                              onClick={() => handleDownload(obj)}
                              className="fs-3 text-dark"
                              style={{
                                position: "absolute",
                                bottom: "1rem",
                                left: "0",
                                borderRadius: "50%",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                          <div className="ms-1">{obj.fileName}</div>
                        </div>
                        <div
                          className=" mt-auto ms-auto"
                          style={{
                            width: "40px",
                            position: "relative",
                            fontSize: "10px",
                          }}
                        >
                          {obj.time}
                        </div>
                      </div>
                    )}
                    <div
                      className="dropstart"
                      style={{ position: "absolute", top: "0", right: "0" }}
                    >
                      <RiArrowDropDownLine
                        className=" dropdown-toggle fs-4"
                        style={{ cursor: "pointer" }}
                        data-bs-toggle="dropdown"
                      />
                      <ul className="dropdown-menu p-0 text-center">
                        <li
                          className="text-center btn d-block"
                          onClick={() => handleModal(obj)}
                        >
                          <p className="dropdown-item m-0">Delete</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="ps-2 mb-1"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="lead m-0 fs-6 d-inline-block text-white bg-secondary p-3 pt-1 pb-1 rounded"
                    style={{ position: "relative" }}
                  >
                    {obj.message ? (
                      <div
                        className="d-flex flex-wrap ms-2 me-2 d-inline"
                        style={{ position: "relative" }}
                      >
                        <p
                          className="m-0 me-2"
                          style={{ position: "relative" }}
                        >
                          {obj.message}
                        </p>
                        <p
                          className="m-0 mt-auto p-0 d-inline"
                          style={{ fontSize: "10px" }}
                        >
                          {obj.time}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="d-flex ms-1 me-1"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="d-flex flex-wrap justify-content-between"
                          style={{ position: "relative" }}
                        >
                          <div style={{ position: "relative" }}>
                            {obj.fileType === "application/pdf" ? (
                              <AiFillFilePdf
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("image") ? (
                              <AiFillFileImage
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/vnd") ? (
                              <AiFillFileExcel
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("zip") ? (
                              <AiFillFileZip
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("text/plain") ? (
                              <AiFillFileText
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes(
                                "application/powerpoint"
                              ) ? (
                              <AiFillFilePpt
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/msword") ? (
                              <AiFillFileWord
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : (
                              <AiFillFileUnknown
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            )}
                            <IoMdDownload
                              onClick={() => handleDownload(obj)}
                              className="fs-3 text-dark"
                              style={{
                                position: "absolute",
                                bottom: "1rem",
                                left: "0",
                                borderRadius: "50%",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                          <p className="ms-1">{obj.fileName}</p>
                        </div>
                        <div
                          className="mt-auto d-inline"
                          style={{
                            position: "relative",
                            fontSize: "10px",
                            width: "50px",
                          }}
                        >
                          {" "}
                          {obj.time}{" "}
                        </div>
                      </div>
                    )}
                  </div>
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
