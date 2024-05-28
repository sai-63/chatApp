import axios from "axios";
import React, { useEffect, useRef, useState ,useContext } from "react";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import SignalRService from './SignalRService';
import { UserContext } from "./UserContext";
import Grpmsg from "./Grpmsg";

function Convo({ person, setShow, setMessage, search, prevMessages, setPrevMessages, allMessages, setAllMessages, 
  allGMessages,setAllGMessages,un,setUN,grpperson,finalmsg,setFinalMsg,freshgrp,setFreshGrp
 }) {
  const host = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  let [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editObject, setEditObject] = useState({});
  const [state, setState] = useState(true);
  const [scroll, setScroll] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [isRead, setIsRead] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
  const [deleteObject, setDeleteObject] = useState({}); // Adjust this as per your delete object structure

  const { user, setUser } = useContext(UserContext);
  let [messagesByDate,setMessagesByDate] = useState({}); 
  // const [freshgrp,setFreshGrp]=useState({}); 
  const [editGObject, setEditGObject] = useState({});
  const [editGMessage, setEditGMessage] = useState("");
  const handleDeleteClose = () => setShowDeleteModal(false);
  console.log("Enter convo freshgrp-- & un--",freshgrp,un)

  const handleDeleteForEveryone = () => {
    const chatDate = new Date(deleteObject.timestamp).toISOString().split('T')[0];
    const msgId = deleteObject.messageId;
    axios
      .post(
        "http://localhost:5290/Chat/DeleteMessage?messageId=" + msgId
      )
      .then((res) => {
        console.log(res.data.message);
      })
      .catch((err) => {
        console.log(err.message);
      });
    SignalRService.removeMessage(person.id, msgId, chatDate);
    SignalRService.sortChats(person.id,null,deleteObject.timestamp);
    SignalRService.sortChats(host,null,deleteObject.timestamp);
    handleDeleteClose();
  };

  const handleDeleteForMe = () => {
    const chatDate = new Date(deleteObject.timestamp).toISOString().split('T')[0];
    const msgId = deleteObject.messageId;

    setAllMessages(allMessages => {
      const updatedMessages = { ...allMessages[person.username] };

      if (updatedMessages[chatDate]) {
        updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.messageId !== msgId);

        if (updatedMessages[chatDate].length === 0) {
          delete updatedMessages[chatDate];
        }
      }

      return {
        ...allMessages,
        [person.username]: updatedMessages
      };
    });

    axios
      .post(
        "http://localhost:5290/Chat/DeleteMessageForMe?messageId=" + msgId
      )
      .then((res) => {
        console.log(res.data.message);
      })
      .catch((err) => {
        console.log(err.message);
      });
      SignalRService.sortChats(host,null,deleteObject.timestamp);
    handleDeleteClose();
  };

  function handleDeleteModal(obj, index) {
    setDeleteObject(obj);
    setShowDeleteModal(true);
  }

  function handleOpen(obj) {
    setShowModal(true);
    setEditObject(obj);
  }
  function handleGOpen(obj) {
    setShowModal(true);
    setEditGObject(obj);
  }

  function handleClose() {
    setShowModal(false);
    setEditObject({});
  }

  const scrollRef = useRef(null);

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    console.log("Entered useeffect at 127")
    if (user.userType === "user") {
      console.log("Entered convo and user have ",prevMessages);
      axios
        .get(`http://localhost:5290/Chat/GetMessagesSenderIdUserId?senderId=${localStorage.getItem("userId")}&receiverId=${person.id}`)
        .then((response) => {
          setPrevMessages(response.data);
          setIsLoaded(false)
        });
    }

    if (user.userType === "group") {
      console.log("Entered convo and group have ",finalmsg);
      // axios
      //   .get(`http://localhost:5290/Chat/GetGroupMessages?groupname=${grpperson.name}`)
      //   .then((res) => {
      //     setFinalMsg(res.data);
      //     setIsLoaded(false)
      //   });
      const gg=grpperson.name
      setFinalMsg(allGMessages[grpperson.name])
      setIsLoaded(false)
      //setFreshGrp(allGMessages[gg])
    }
  }, [person, grpperson, user.userType,allGMessages,setFinalMsg,setFreshGrp]);

  useEffect(() => {

    SignalRService.setReceiveMessageCallback((chat) => {
      console.log("Person Nameeeeeeeeeeeeeeeeeeeeeeeee:",person.username);
      if (chat.receiverId === host) {
        axios.post('http://localhost:5290/Chat/markasread?messageIds', [chat.messageId])
          .then((response) => {
            console.log(response.data);
          })
      }
      const chatDate = new Date(chat.timestamp).toISOString().split('T')[0]; // Extract date from timestamp

      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[person.username] };

        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = [...updatedMessages[chatDate], chat]; // Append chat to existing date's messages
        } else {
          updatedMessages[chatDate] = [chat]; // Create a new list for the date if it doesn't exist
        }

        return {
          ...allMessages,
          [person.username]: updatedMessages
        };
      });
    });

    const removeMessage = (chatDate, messageId) => {
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[person.username] };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.messageId !== messageId);
          if (updatedMessages[chatDate].length === 0) {
            delete updatedMessages[chatDate];
          }
        }
        return {
          ...allMessages,
          [person.username]: updatedMessages
        };
      });
    };


    SignalRService.setRemoveMessageCallback((id, chatDate) => {
      removeMessage(chatDate, id);
    });

    // Function to update the chat message with matching messageId from a specific date
    const editMessage = (date, messageId, newMessage) => {
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[person.username] };
        if (updatedMessages[date]) {
          updatedMessages[date] = updatedMessages[date].map(message =>
            message.messageId === messageId ? { ...message, message: newMessage } : message
          );
        }
        // Update allMessages with updated messages for the person
        return {
          ...allMessages,
          [person.username]: updatedMessages
        };
      });
    };

    SignalRService.setEditMessageCallback((messageId, newMessage, chatDate) => {
      editMessage(chatDate, messageId, newMessage);
    });

    const readMessage = (messageIds) => {
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[person.username] };
        for (const key in updatedMessages) {
          if (updatedMessages.hasOwnProperty(key)) {
            const messageList = updatedMessages[key];
            updatedMessages[key] = messageList.map(message => {
              if (messageIds.includes(message.messageId)) {
                return { ...message, isRead: true };
              }
              return message;
            });
          }
        }
        // Update allMessages with updated prevMessages
        return {
          ...allMessages,
          [person.username]: updatedMessages
        };
      });
    };

    SignalRService.setReadMessageCallback((messageIds) => {
      readMessage(messageIds);
    });
  }, [person]);
  useEffect(() => {
    const editGMessage = (date, messageId, newMessage) => {
      setMessagesByDate(messagesByDate => {
        const updatedgrpMessages = { ...messagesByDate };
        if (updatedgrpMessages[date]) {
          updatedgrpMessages[date] = updatedgrpMessages[date].map(message =>
            message.id === messageId ? { ...message, message: newMessage } : message
          );
        }
        return {
          ...messagesByDate,
          [grpperson.id]: updatedgrpMessages
        };
      });
    };

    SignalRService.setEditGMessageCallback((messageId, newMessage, chatDate) => {
      editGMessage(chatDate, messageId, newMessage);
    });
  },[grpperson]);

  useEffect(() => {
    SignalRService.changeReceiver(person.id);
  }, [person]);

  const handleDownload = async (obj) => {
    try {
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

    const messages = allMessages[person.username];
    const newMessages = [];
    for (const key in messages) {
      if (messages.hasOwnProperty(key)) {
        const messageList = messages[key];
        messageList.forEach(message => {
          if (message.senderId !== host && !message.isRead) {
            newMessages.push(message.messageId);
          }
        });
      }
    }
    axios.post(`http://localhost:5290/Chat/markasread?messageIds`, newMessages)
      .then((response) => {
        console.log(response.data)
      })
      .catch((err) => console.log(err.message));
    console.log('New messagessssssssssssssssssssssssss:', newMessages);
    SignalRService.readMessage(person.id, newMessages);

  }, [person, search]);


  useEffect(() => {
    setState(!state);
    // console.log("Prev messages changed in convo:",prevMessages);
  }, [prevMessages])

  useEffect(() => {
    setIsLoaded(true);
  }, [person]);

  useEffect(() => {
    scrollDown();
  }, [scroll]);

  useEffect(() => {
    setDeleteObject(deleteObject)
  }, [deleteObject]);

  useEffect(() => {
    console.log("Entered useeffect at 351")
    // const abc=async()=> {
      console.log("Going to change",finalmsg)
      console.log("We have fornow as",finalmsg.messages)
      // if(Array.isArray(finalmsg)){
      if(finalmsg && Array.isArray(finalmsg.messages)){
        console.log("Array selected only")
        const newMessagesByDate = {};

        finalmsg.messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toISOString().split('T')[0]
        if (!newMessagesByDate[date]) {
          newMessagesByDate[date] = [];
        }      
        newMessagesByDate[date].push(msg);
      });  

      setFreshGrp(newMessagesByDate);
      console.log("newwwww",newMessagesByDate)
      setMessagesByDate(newMessagesByDate);
      //setAllGMessages(newMessagesByDate);      
    }else{
      console.log("oyy not array dude")
    }
    console.log("changed atl one",messagesByDate,allGMessages,freshgrp)
    //}
    // abc()
  // }, [finalmsg,setFreshGrp,setMessagesByDate]);
  },[grpperson,finalmsg,un]);




  if (isLoaded) {
    return (
      <div className="bg-white d-flex" style={{ height: "82%" }}>
        <Spinner className="m-auto" animation="border" variant="primary" />
      </div>
    );
  }

  const convertMillisecondsToTime = (milliseconds) => {
    return milliseconds;
  };

  function handleEdit() {
    if(user.userType=="user"){
      const chatDate = new Date(editObject.timestamp).toISOString().split('T')[0];
      const msgId = editObject.messageId;
      console.log("Edit Obj Msg Id : ", msgId);
      console.log("New Message is : ", editMessage);
      setPrevMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        return updatedMessages;
      });
      setAllMessages(allMessages => {
        const updatedAllMessages = { ...allMessages };
        updatedAllMessages[person.username] = prevMessages;
        return updatedAllMessages;
      });
      axios.post(`http://localhost:5290/Chat/EditMessage?messageId=${msgId}&newMessage=${editMessage}`)
        .then((res) => {
          console.log(res.data.message);
        })
        .catch((err) => {
          console.log(err.message);
        });
      SignalRService.editMessage(person.id, msgId, editMessage, chatDate);
      setShowModal(false);
      setEditMessage('');
    }else{
      console.log("heheheh",editGObject)
      const chatDate = new Date(editGObject.timestamp).toISOString().split('T')[0];
      const msgId = editGObject.id;
      console.log("heheheh",editGObject)
      console.log("Edit Obj Msg Id : ", msgId);
      console.log("New Message is : ", editGMessage);
      setFinalMsg(finalmsg => {
        const updatedMessages = { ...finalmsg };
        return updatedMessages;
      });
      axios.post(`http://localhost:5290/Chat/EditGroupMessage?groupname=${grpperson.name}&messageId=${msgId}&newMessage=${editGMessage}`)
        .then((res) => {
          console.log(res.data.message);
        })
        .catch((err) => {
          console.log(err.message);
        });
      SignalRService.editGMessage(grpperson.id, msgId, editGMessage, chatDate);
      setShowModal(false);
      setEditGMessage('');
    }
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

  function getDay(date) {
    const todayDate = new Date();
    const Today = todayDate.toISOString().split('T')[0];

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);

    const Yesterday = yesterdayDate.toISOString().split('T')[0];
    if (Today === date) {
      return "Today";
    } else if (Yesterday === date) {
      return "Yesterday";
    }
    return date;
  }


  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-light h-100"
      >
        {user.userType==="user" ? (          
          <div className="mt-auto">
            {console.log("user called")}
            {Object.keys(allMessages[person.username]).map((date) => (
              <div key={date}>
                <div className="text-center my-3">
                  <div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
                    {getDay(date)}
                  </div>
                </div>
                {allMessages[person.username][date].map((obj, index) =>
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
                        {obj.fileType === null ? (
                          <div
                            className="d-flex flex-wrap ms-2 me-2 mt-1"
                            id={index}
                            style={{ position: "relative" }}
                          >
                            <p className="m-0 me-2" style={{ position: "relative" }}>
                              {obj.message}
                            </p>
                            <div className="d-flex align-items-end ms-auto" style={{ position: "relative" }}>
                              <p className="m-0 mt-auto ms-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                                {getCurrentTime(obj.timestamp)}
                              </p>
                              <FontAwesomeIcon
                                icon={faCheckDouble}
                                className="ms-1"
                                style={{ fontSize: "10px", color: obj.isRead ? "blue" : "white" }}
                              />
                            </div>
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
                            <li className="text-center btn d-block" onClick={() => handleDeleteModal(obj, index)}>
                              <p className="dropdown-item m-0">Delete</p>
                            </li>
                            <li className="text-center btn d-block" onClick={() => handleOpen(obj)}>
                              <p className="dropdown-item m-0">Edit</p>
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
                        {obj.fileType === null ? (
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
          <div className="mt-auto">
            {console.log("group called fgrp and un as",freshgrp,un)}
            {console.log("group called msgdt",messagesByDate)}
            {Object.keys(freshgrp).map((dt) => (
              <div key={dt}>
                <div className="text-center my-3">
                  <div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
                    {getDay(dt)}
                  </div>
                </div>
                {freshgrp[dt].map((obj, index) =>
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
                        {obj.fileType === null ? (
                          <div
                            className="d-flex flex-wrap ms-2 me-2 mt-1"
                            id={index}
                            style={{ position: "relative" }}
                          >
                            <p className="m-0 me-2" style={{ position: "relative", fontSize: "12px" }}>
                              {un[obj.senderId]}
                            </p>
                            <p className="m-0 me-2" style={{ position: "relative" }}>
                              {obj.message}
                            </p>
                            <div className="d-flex align-items-end ms-auto" style={{ position: "relative" }}>
                              <p className="m-0 mt-auto ms-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                                {getCurrentTime(obj.timestamp)}
                              </p>
                              <FontAwesomeIcon
                                icon={faCheckDouble}
                                className="ms-1"
                                style={{ fontSize: "10px", color: obj.isRead ? "blue" : "white" }}
                              />
                            </div>
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
                            <li className="text-center btn d-block" onClick={() => handleDeleteModal(obj, index)}>
                              <p className="dropdown-item m-0">Delete</p>
                            </li>
                            <li className="text-center btn d-block" onClick={() => handleOpen(obj)}>
                              <p className="dropdown-item m-0">Edit</p>
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
                        {obj.fileType === null ? (
                          <div className="d-flex flex-wrap ms-2 me-2 d-inline" style={{ position: "relative" }}>
                            <p className="m-0 me-2" style={{ position: "relative", fontSize: "12px" }}>
                              {un[obj.senderId]}
                            </p>
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
      {user.userType=="user"?
      <div>
        <Modal centered size="sm" show={showModal} onHide={handleClose}>
        <Modal.Body>
          {`Input your new message..
        
          ${deleteObject.message ? deleteObject.message : deleteObject.fileName
            }`}
        </Modal.Body>
        <Modal.Footer>
          <input id="msg" type="text" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} required />
          <Button variant="success" onClick={handleEdit}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal centered size="sm" show={showDeleteModal} onHide={handleDeleteClose}>
        <Modal.Body>
          Are you sure you want to delete this message?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteForEveryone}>
            Delete for everyone
          </Button>
          <Button variant="warning" onClick={handleDeleteForMe}>
            Delete for me
          </Button>
          <Button variant="secondary" onClick={handleDeleteClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      </div>:
      <div>
        <Modal centered size="sm" show={showModal} onHide={handleClose}>
        <Modal.Body>
          {`Input your new message..
        
          ${deleteObject.message ? deleteObject.message : deleteObject.fileName
            }`}
        </Modal.Body>
        <Modal.Footer>
          <input id="msg" type="text" value={editGMessage} onChange={(e) => setEditGMessage(e.target.value)} required />
          <Button variant="success" onClick={handleEdit}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal centered size="sm" show={showDeleteModal} onHide={handleDeleteClose}>
        <Modal.Body>
          Are you sure you want to delete this message?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteForEveryone}>
            Delete for everyone
          </Button>
          <Button variant="warning" onClick={handleDeleteForMe}>
            Delete for me
          </Button>
          <Button variant="secondary" onClick={handleDeleteClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal></div>}
    </div>
  );
}

export default Convo;
