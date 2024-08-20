import axios from "axios";
import React, { useEffect, useRef, useState ,useContext} from "react";
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

function Convo({ person, setShow, setMessage, search, prevMessages, setPrevMessages, allMessages, setAllMessages,  
  replyObject, setReplyObject, allGMessages,setAllGMessages,un,setUN,grpperson,finalmsg,setFinalMsg}) {
  const host = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const [floatingCard, setFloatingCard] = useState(null);
  let [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editObject, setEditObject] = useState({});
  const [state, setState] = useState(true);
  const [scroll, setScroll] = useState(false);
  const scrollRef = useRef(null);
  const messageRefs = useRef({});
  const [editMessage, setEditMessage] = useState("");
  const [showReceivedDeleteModal,setShowReceivedDeleteModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
  const [deleteObject, setDeleteObject] = useState({}); // Adjust this as per your delete object structure

  //const handleDeleteClose = () => setShowDeleteModal(false);
  const { user, setUser } = useContext(UserContext);
  const [editGObject, setEditGObject] = useState({});
  const [editGMessage, setEditGMessage] = useState("");  
  const [currentGroup, setCurrentGroup] = useState(null);
  console.log("Enter convo un--",un)
  const [gmessages, setGMessages] = useState([]);
  const handleDeleteClose = () => setShowDeleteModal(false);

  const handleReplyClick = (obj) => {
    setReplyObject(obj);
    setFloatingCard(obj);
  };

  useEffect(()=>{
    if(replyObject.messageId===undefined){
      setFloatingCard(null);
    }
  },[replyObject]);

  const closeFloatingCard = () => {
    setReplyObject({});
    setFloatingCard(null);
  };

  const handleReceivedDeleteClose = () => setShowReceivedDeleteModal(false);

  const handleDeleteForEveryone = () => {
    if (user.userType==="user") {
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
      SignalRService.removeMessage(person.id, msgId, chatDate, username);
      SignalRService.sortChats(person.id,null,deleteObject.timestamp);
      SignalRService.sortChats(host,null,deleteObject.timestamp);
    }else{
      const chatDate = new Date(deleteObject.timestamp).toISOString().split('T')[0];
      const msgId = deleteObject.idd;
      axios
        .post(
          `http://localhost:5290/Chat/DeleteGrpMessageForAll?groupname=${grpperson.name}&messageId=${msgId}`
        )
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err.message);
        });
      SignalRService.removeGrpMessage(grpperson.name, msgId, chatDate);
    }
    handleDeleteClose();
  };

  const handleDeleteForMe = () => {
    if (user.userType==="user") {
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
    }else{
      const chatDate = new Date(deleteObject.timestamp).toISOString().split('T')[0];
      const msgId = deleteObject.idd;

      setAllGMessages(allGMessages => {
        const updatedMessages = { ...allGMessages[grpperson.name] };  
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => 
          {
            if(message.idd === msgId){
              message.DeletedBy=true;
              return false;
            }
            return true;
          });
          if (updatedMessages[chatDate].length === 0) {
            delete updatedMessages[chatDate];
          }
        }
  
        return {
          ...allGMessages,
          [grpperson.name]: updatedMessages
        };
      });
      axios      
      .post(
        `http://localhost:5290/Chat/DeleteGrpForme?groupname=${grpperson.name}&messageId=${msgId}`
      )
      .then((res) => {
        console.log(res.data.message);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    handleDeleteClose();
  };

  const handleReceivedDeleteForMe = () => {
    // const chatDate = new Date(deleteObject.timestamp).toISOString().split('T')[0];
    // const msgId = deleteObject.messageId;

    // setAllMessages(allMessages => {
    //   const updatedMessages = { ...allMessages[person.username] };

    //   if (updatedMessages[chatDate]) {
    //     updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.messageId !== msgId);

    //     if (updatedMessages[chatDate].length === 0) {
    //       delete updatedMessages[chatDate];
    //     }
    //   }

    //   return {
    //     ...allMessages,
    //     [person.username]: updatedMessages
    //   };
    // });

    // axios
    //   .post(
    //     "http://localhost:5290/Chat/DeleteMessageForMe?messageId=" + msgId
    //   )
    //   .then((res) => {
    //     console.log(res.data.message);
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
    //   SignalRService.sortChats(host,null,deleteObject.timestamp);
    // handleReceivedDeleteClose();
  };

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  function handleDeleteModal(obj, index) {
    setDeleteObject(obj);
    setShowDeleteModal(true);
  }

  function handleOpen(obj) {
    setShowModal(true);
    setEditObject(obj);
  }

  function handleClose() {
    setShowModal(false);
    setEditObject({});
  }

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  //Handle user group chats
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
      console.log("Init group name --",localStorage.getItem("groupnaam"))
      //SignalRService.joinGroup(grpperson.name)      
      console.log("Setting allg   --",allGMessages[grpperson.name],localStorage.getItem("groupid"))
      setFinalMsg(allGMessages[grpperson.name]);
      setIsLoaded(false);
    }
  }, [person, grpperson, user.userType]);

  useEffect(() => {

    SignalRService.setReceiveMessageCallback((chat, userName) => {
      console.log("Received the messageeeeee:",chat);
      if (chat.receiverId === host) {
        axios.post('http://localhost:5290/Chat/markasread?messageIds', [chat.messageId])
          .then((response) => {
            console.log(response.data);
          })
          if(person.username===userName){
            SignalRService.readMessage(chat.senderId, [chat.messageId], username);
          }
          SignalRService.incrementUnseenMessages(host, person.username, "seen");
      }
      var userName= userName==username ? person.username : userName;
      const chatDate = new Date(chat.timestamp).toISOString().split('T')[0];
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[userName] };

        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = [...updatedMessages[chatDate], chat]; // Append chat to existing date's messages
        } else {
          updatedMessages[chatDate] = [chat]; // Create a new list for the date if it doesn't exist
        }
        console.log("Is it workinggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg??????????????????");

        return {
          ...allMessages,
          [userName]: updatedMessages
        };
      });
    });

    const removeMessage = (chatDate, messageId, senderName) => {
      const userName = username===senderName ? person.username : senderName;
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[userName] };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.messageId !== messageId);
          if (updatedMessages[chatDate].length === 0) {
            delete updatedMessages[chatDate];
          }
        }
        return {
          ...allMessages,
          [userName]: updatedMessages
        };
      });
    };


    SignalRService.setRemoveMessageCallback((id, chatDate, senderName) => {
      removeMessage(chatDate, id, senderName);
    });

    // Function to update the chat message with matching messageId from a specific date
    const editMessage = (date, messageId, newMessage, senderName) => {
      const userName = username===senderName ? person.username : senderName;
      setAllMessages(allMessages => {
        const updatedMessages = { ...allMessages[userName] };
        if (updatedMessages[date]) {
          updatedMessages[date] = updatedMessages[date].map(message =>
            message.messageId === messageId ? { ...message, message: newMessage } : message
          );
        }
        // Update allMessages with updated messages for the person
        return {
          ...allMessages,
          [userName]: updatedMessages
        };
      });
    };

    SignalRService.setEditMessageCallback((messageId, newMessage, chatDate, senderName) => {
      editMessage(chatDate, messageId, newMessage, senderName);
    });

    const readMessage = (messageIds, senderName) => {
        setAllMessages(allMessages => {
          const updatedMessages = { ...allMessages[senderName] };
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
            [senderName]: updatedMessages
          };
        });
    };

    SignalRService.setReadMessageCallback((messageIds, senderName) => {
      readMessage(messageIds, senderName);
    });
  }, [person,allMessages]);

  useEffect(() => {
    SignalRService.setReceiveGroupMessageCallback((grpName,grpmsg)=>{
      console.log("setting rec grp mclback - ",grpName,grpmsg)
      var curgrp=grpperson.name==grpName?grpperson.name:grpName
      const chatDate = new Date(grpmsg.timestamp).toISOString().split('T')[0];
      setAllGMessages(allGMessages => {
        const updatedMessages = { ...allGMessages[curgrp] };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = [...updatedMessages[chatDate], grpmsg]; // Append chat to existing date's messages
        } else {
          updatedMessages[chatDate] = [grpmsg]; // Create a new list for the date if it doesn't exist
        }
        return {
          ...allGMessages,
          [curgrp]: updatedMessages
        };
        }
      )
    })

    const removeGrpMessage = (groupName,messageId, chatDate) => {
      const curgrp = grpperson.name===groupName ?grpperson.name : groupName;
      setAllGMessages(allGMessages => {
        const updatedMessages = { ...allGMessages[curgrp] };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = updatedMessages[chatDate].filter(message => message.idd !== messageId);
          if (updatedMessages[chatDate].length === 0) {
            delete updatedMessages[chatDate];
          }
        }
        return {
          ...allGMessages,
          [curgrp]: updatedMessages
        };
      });
    };


    SignalRService.setGrpRemoveMessageCallback((groupName,messageId, chatDate) => {
      removeGrpMessage(groupName,messageId, chatDate);
    });


    const editGroupMessage = (groupName,messageId, newMessage, chatDate) => {
      const curgrp = grpperson.name===groupName ?grpperson.name : groupName;
      setAllGMessages(allGMessages => {
        const updatedMessages = { ...allGMessages[curgrp] };
        if (updatedMessages[chatDate]) {
          updatedMessages[chatDate] = updatedMessages[chatDate].map(message =>
            message.idd === messageId ? { ...message, message: newMessage } : message
          );
        }
        // Update allMessages with updated messages for the person
        return {
          ...allGMessages,
          [curgrp]: updatedMessages
        };
      });
    };

    SignalRService.setEditGroupMessageCallback((groupName,messageId, newMessage, chatDate) => {
      editGroupMessage(groupName,messageId, newMessage, chatDate);
    });
  },[grpperson])

  useEffect(() => {
    SignalRService.changeReceiver(person.id);
  }, [person]);

  const handleDownload = async (obj) => {
    try {
      const response = await axios.post('http://localhost:5290/Chat/DownloadFile', obj, {
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'];
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', obj.fileName);
      if (contentType) {
        link.setAttribute('type', contentType);
      }
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
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
    SignalRService.readMessage(person.id, newMessages, username);
    scrollDown();
  }, [person, search]);


  useEffect(() => {
    setState(!state);
  }, [prevMessages])

  useEffect(() => {
    if(user.userType==="user"){
      setIsLoaded(true);
    }
  }, [person]);

  useEffect(()=>{
    scrollDown();
  },[isLoaded,allMessages[person.username]]);

  useEffect(() => {
    setDeleteObject(deleteObject)
  }, [deleteObject]);

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
    if(user.userType==='user'){
      const chatDate = new Date(editObject.timestamp).toISOString().split('T')[0];
      const msgId = editObject.messageId;
      console.log("Edit Obj Msg Id : ", msgId);
      console.log("New Message is : ", editMessage);
      axios.post(`http://localhost:5290/Chat/EditMessage?messageId=${msgId}&newMessage=${editMessage}`)
        .then((res) => {
          console.log(res.data.message);
        })
        .catch((err) => {
          console.log(err.message);
        });
      SignalRService.editMessage(person.id, msgId, editMessage, chatDate, username);
      setShowModal(false);
      setEditMessage('');
    }else{
      console.log("We have editObject in group as----",editObject)
      const chatDate = new Date(editObject.timestamp).toISOString().split('T')[0];
      const msgId = editObject.idd;
      console.log("Edit Obj Group Msg Id : ", msgId);
      console.log("New Message is : ", editMessage);
      axios.post(`http://localhost:5290/Chat/EditGrpMessage?groupName=${grpperson.name}&messageId=${msgId}&newMessage=${editMessage}`)
        .then((res) => {
          console.log(res.data.message);
        })
        .catch((err) => {
          console.log(err.message);
        });
      SignalRService.editGroupMessage(grpperson.name, msgId, editMessage, chatDate);
      setShowModal(false);
      setEditMessage('');
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

  const getRepliedMessage = (messageId) => {
    for (const date in allMessages[person.username]) {
      for (const message of allMessages[person.username][date]) {
        if (message.messageId === messageId) {
          return message;
        }
      }
    }
    return null;
  };

  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-light h-100"
      >
        {user.userType==="user" ? (          
          <div className="mt-auto">
          {Object.keys(allMessages[person.username]).length === 0 ? (
              <p className="lead text-secondary m-auto">Chat is Empty</p>):
            (Object.keys(allMessages[person.username]).map((date) => (
              <div key={date}>
                <div className="text-center my-3">
                  <div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
                    {getDay(date)}
                  </div>
                </div>
                {allMessages[person.username][date].map((obj, index) => {
                  const repliedMessage = obj.replyToMessageId !== "null" ? getRepliedMessage(obj.replyToMessageId) : null;

                  return obj.senderId === host ? (
                    <div
                      key={index}
                      ref={(el) => (messageRefs.current[obj.messageId] = el)}
                      className="ms-auto pe-3 mb-1 d-flex"
                      style={{ width: "60%", wordBreak: "break-word" }}
                    >
                      <div
                        className="d-inline-block ms-auto fs-6 lead m-0 bg-success pt-1 pb-1 rounded text-white"
                        style={{ position: "relative" }}
                      >
                        {repliedMessage ? (
                          <div className="bg-dark text-white p-1 rounded mb-1" onClick={() => scrollToMessage(repliedMessage.messageId)}>
                            <p className="m-0">{repliedMessage.message}</p>
                          </div>
                        ) : null}

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
                            <li className="text-center btn d-block" onClick={() => handleReplyClick(obj)}>
                              <p className="dropdown-item m-0">Reply</p>
                            </li>
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
                      ref={(el) => (messageRefs.current[obj.messageId] = el)}
                      className="ps-2 mb-1"
                      style={{ width: "60%", wordBreak: "break-word" }}
                    >
                      <div
                        className="lead m-0 fs-6 d-inline-block text-white bg-secondary p-3 pt-1 pb-1 rounded"
                        style={{ position: "relative" }}
                      >
                        {repliedMessage ? (
                          <div className="bg-dark text-white p-1 rounded mb-1" onClick={() => scrollToMessage(repliedMessage.messageId)}>
                            <p className="m-0">{repliedMessage.message}</p>
                          </div>
                        ) : null}
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
                        <div className="dropstart" style={{ position: "absolute", top: "0", right: "0" }}>
                          <RiArrowDropDownLine
                            className="dropdown-toggle fs-4"
                            style={{ cursor: "pointer" }}
                            data-bs-toggle="dropdown"
                          />
                          <ul className="dropdown-menu p-0 text-center">
                            <li className="text-center btn d-block" onClick={() => handleReplyClick(obj)}>
                              <p className="dropdown-item m-0">Reply</p>
                            </li>
                            <li className="text-center btn d-block" onClick={() => handleDeleteModal(obj, index)}>
                              <p className="dropdown-item m-0">Delete</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )))}
          </div>
        ) : (
          <div className="mt-auto">
            {console.log("1111111111111111111111111111111111111111111111111111")}
            {Object.keys(allGMessages[grpperson.name]).length === 0 ? (
              <p className="lead text-secondary m-auto">Group Chat is Empty</p>):
            (Object.keys(allGMessages[grpperson.name]).map((dt) => (
              <div key={dt}>
                <div className="text-center my-3">
                  <div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
                    {getDay(dt)}
                  </div>
                </div>
                {allGMessages[grpperson.name][dt].map((obj, index) =>    
                obj.senderId === host && obj.deletedBy==false? (
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
                        ): (
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
            )))}
          </div> 
          // <p className="lead text-secondary m-auto">Chat is Empty</p>
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
        {floatingCard && (
          <div className="position-fixed bg-white border rounded p-3 shadow"
            style={{
              bottom: "80px",
              right: "50px",
              width: "1000px",
              zIndex: 1000,
              color: "black"
            }}
          >
          <div className="d-flex justify-content-between align-items-center">
            <strong>Replying to:</strong>
            <button onClick={closeFloatingCard} className="btn-close" />
          </div>
          <div className="mt-2">
            {floatingCard.message}
            <div className="text-end" style={{ fontSize: "10px" }}>
              {getCurrentTime(floatingCard.timestamp)}
            </div>
          </div>
          </div>
        )}
        <Modal centered size="sm" show={showModal} onHide={handleClose}>
          <Modal.Body>
            {`Input your new message..
              ${deleteObject.message ? deleteObject.message : deleteObject.fileName}`
            }
          </Modal.Body>
          <Modal.Footer>
            <input id="msg" type="text" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} required />
            <Button variant="success" onClick={handleEdit}>
              Edit
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal centered size="sm" show={showReceivedDeleteModal} onHide={handleReceivedDeleteClose}>
          <Modal.Body>Are you sure you want to delete this message?</Modal.Body>
          <Modal.Footer>
            <Button variant="warning" onClick={handleReceivedDeleteForMe}>
              Delete for me
            </Button>
            <Button variant="secondary" onClick={handleReceivedDeleteClose}>Cancel</Button>
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
      </div>
      :
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
      </div>
    }
    </div>
  );
}

export default Convo;
