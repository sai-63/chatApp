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
import SignalRService from './SignalRService';

function Convo({ person, setShow, setMessage, search ,prevMessages ,setPrevMessages }) {
  let host = localStorage.getItem("userId");
  let [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteObject, setDeleteObject] = useState({});
  const [state, setState] = useState(true);
  const [scroll, setScroll] = useState(false);
  let delObj = {};

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
  const handleDownload = async (obj) => {
    try {
      // Set downloading state to true to indicate that download is in progress
      //setDownloading(true);

      // Make a request to the backend to download the file content
      // const response = await axios.get('http://localhost:5290/Chat/DownloadFile', {
      //   params: obj, // Pass the entire message object as query parameters
      //   responseType: 'blob' // Set response type to blob to handle file download
      // });
      const response = await axios.post('http://localhost:5290/Chat/DownloadFile', obj, {
        responseType: 'blob' // Set response type to blob to handle file download
      });
  
      // Determine content type from response headers
      const contentType = response.headers['content-type'];
  
      // Create a URL for the blob and create a link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', obj.fileName); // Set file name
  
      // If content type is known, set it for the downloaded file
      if (contentType) {
        link.setAttribute('type', contentType);
      }
  
      document.body.appendChild(link);
      link.click();

      // Reset downloading state after successful download
     // setDownloading(false);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Handle error
      // Reset downloading state
      //setDownloading(false);
    }
  };

  useEffect(() => {

    let hosting = localStorage.getItem("user");

    axios.get("http://localhost:5290/Chat/GetMessagesSenderIdUserId", {params: {senderId: host,receiverId: person.id}})
      .then((response) => {
        console.log(response) 
        console.log(response.data);
        setPrevMessages(response.data);
        setShow(false);
        //setMessage("");
        setIsLoaded(true);
        setScroll(!scroll);
        setMessage("");
        console.log(prevMessages);
      })
      .catch((err) => console.log(err.message));
      
  }, [person, search]);
  
  
  useEffect(()=>{
    setState(!state);
    // console.log("Prev messages changed in convo:",prevMessages);
  },[prevMessages])

  useEffect(() => {
    SignalRService.setRemoveMessageCallback((id, chatDate) => {
      // Function to remove the chat with matching messageId from a specific date
      const removeMessage = (date, messageId) => {
        setPrevMessages(prevMessages => {
          const updatedMessages = { ...prevMessages };
          if (updatedMessages[date]) {
            updatedMessages[date] = updatedMessages[date].filter(message => message.messageId !== messageId);
          }
          return updatedMessages;
        });
      };
  
      // Call the function to remove the message with the provided id from the specified date
      removeMessage(chatDate, id);
    });
  }, []);
  

  useEffect(() => {
    setIsLoaded(true);
  }, [person]);

  useEffect(() => {
    scrollDown();
  }, [scroll]);

  useEffect(()=>{
    setDeleteObject(deleteObject)
  },[deleteObject]);

  

  if (!isLoaded) {
    return (
      <div className="bg-white d-flex" style={{ height: "82%" }}>
        <Spinner className="m-auto" animation="border" variant="primary" />
      </div>
    );
  }

  const convertMillisecondsToTime = (milliseconds) => {
return milliseconds;
  };

  function handleModal(obj,index) {
    console.log("index",index);
    // setShowModal(true);
    console.log("Object issssss:",obj);
    const chatDate = new Date(obj.timestamp).toISOString().split('T')[0];
    const msgId = obj.messageId;
    console.log("Obj Msg Id",msgId);
    setPrevMessages(prevMessages => {
      const updatedMessages = { ...prevMessages };
      if (updatedMessages[chatDate]) {
        updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.messageId !== obj.id);
      }
      return updatedMessages;
    });
    axios
      .post(
        "http://localhost:5290/Chat/DeleteMessage?id="+msgId
      )
      .then((res) => {
        console.log(res.data.message);
        // const socketObj = {};
        // socketObj.senderId = host;
        // socketObj.receiverId = person.userid;
        // socket.emit("delete-message", socketObj);
      })
      .catch((err) => {
        console.log(err.message);
      });
    SignalRService.removeMessage(person.id,msgId,chatDate);
  }

  function handleDelete() {
    console.log(deleteObject.id);
    // axios
    //   .post(
    //     "http://localhost:5290/Chat/DeleteMessage",{objectIdComponents: deleteObject.id}
    //   )
    //   .then((res) => {
    //     setMessage(res.data.message);
    //     const socketObj = {};
    //     socketObj.senderId = host;
    //     socketObj.receiverId = person.userid;
    //     socket.emit("delete-message", socketObj);
    //   })
    //   .catch((err) => {
    //     setMessage(err.message);
    //     setDeleteObject({});
    //   });
    //   handleClose();
  }

  function getCurrentTime(timestamp) {
    let currentDate = new Date(timestamp);
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const currentTime = hours + ':' + formattedMinutes + ' ' + ampm;
    return currentTime;
  }


  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-light h-100"
      >
        {Object.keys(prevMessages).length !== 0 ? (
          <div className="mt-auto">
            {Object.keys(prevMessages).map((date) => (
              <div key={date}>
                <div className="text-center my-3">
  <div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
    {date}
  </div>
</div>
                {prevMessages[date].map((obj, index) =>
                  obj.senderId === host ? (
                    <div
                      key={index}
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
                            id={index}
                            style={{ position: "relative" }}
                          >
                            <p className="m-0 me-2" style={{ position: "relative" }}>
                              {obj.message}
                            </p>
                            <p className="m-0 mt-auto ms-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                              {getCurrentTime(obj.timestamp)}
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
                              {obj.fileType ? (
                                <div style={{ position: "relative" }}>
                                  {obj.fileType === "application/pdf" ? (
                                    <AiFillFilePdf style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("image") ? (
                                    <AiFillFileImage style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/vnd") ? (
                                    <AiFillFileExcel style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("zip") ? (
                                    <AiFillFileZip style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("text/plain") ? (
                                    <AiFillFileText style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/powerpoint") ? (
                                    <AiFillFilePpt style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/msword") ? (
                                    <AiFillFileWord style={{ width: "50px", height: "50px" }} />
                                  ) : (
                                    <AiFillFileUnknown style={{ width: "50px", height: "50px" }} />
                                  )}
                                </div>
                              ) : null}
                              <div className="ms-1">{obj.fileName}</div>
                            </div>
                            <div
                              className="mt-auto ms-auto"
                              style={{ width: "40px", fontSize: "10px" }}
                            >
                              {getCurrentTime(obj.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className="dropstart" style={{ position: "absolute", top: "0", right: "0" }}>
                          <RiArrowDropDownLine
                            className="dropdown-toggle fs-4"
                            style={{ cursor: "pointer" }}
                            data-bs-toggle="dropdown"
                          />
                          <ul className="dropdown-menu p-0 text-center">
                            <li className="text-center btn d-block" onClick={() => handleModal(obj, index)}>
                              <p className="dropdown-item m-0">Delete</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="ps-2 mb-1"
                      style={{ width: "60%", wordBreak: "break-word" }}
                    >
                      <div
                        className="lead m-0 fs-6 d-inline-block text-white bg-secondary p-3 pt-1 pb-1 rounded"
                        style={{ position: "relative" }}
                      >
                        {obj.message ? (
                          <div className="d-flex flex-wrap ms-2 me-2 d-inline" style={{ position: "relative" }}>
                            <p className="m-0 me-2" style={{ position: "relative" }}>
                              {obj.message}
                            </p>
                            <p className="m-0 mt-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                              {getCurrentTime(obj.timestamp)}
                            </p>
                          </div>
                        ) : (
                          <div className="d-flex ms-1 me-1" style={{ position: "relative" }}>
                            <div className="d-flex flex-wrap justify-content-between" style={{ position: "relative" }}>
                              {obj.fileType ? (
                                <div style={{ position: "relative" }}>
                                  {obj.fileType === "application/pdf" ? (
                                    <AiFillFilePdf style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("image") ? (
                                    <AiFillFileImage style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/vnd") ? (
                                    <AiFillFileExcel style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("zip") ? (
                                    <AiFillFileZip style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("text/plain") ? (
                                    <AiFillFileText style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/powerpoint") ? (
                                    <AiFillFilePpt style={{ width: "50px", height: "50px" }} />
                                  ) : obj.fileType.includes("application/msword") ? (
                                    <AiFillFileWord style={{ width: "50px", height: "50px" }} />
                                  ) : (
                                    <AiFillFileUnknown style={{ width: "50px", height: "50px" }} />
                                  )}
                                </div>
                              ) : null}
                              <p className="ms-1">{obj.fileName}</p>
                            </div>
                            <div className="mt-auto d-inline" style={{ fontSize: "10px", width: "50px" }}>
                              {getCurrentTime(obj.timestamp)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="lead text-secondary m-auto">Chat is Empty</p>
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
    </div>
  );
}

export default Convo;
