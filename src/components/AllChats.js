import axios, { all } from "axios";
import React, { useEffect, useState } from "react";
import { AiFillCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
import SignalRService from "./SignalRService";

function AllChats({ show, setShow, message, setMessage, showPerson, userIds, setUserIds, allMessages, unseenMessages, setUnseenMessages }) {
  const [host, setHost] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    setHost(userId);
    setUsername(username);
  }, []);

  useEffect(()=>{
    console.log("All Messages changed :",allMessages);
  },[allMessages]);

  useEffect(() => {
    SignalRService.setOnlineUsersCallback((Username) => {
      setUserIds((userIds) => {
        let userFound = false;
        const updatedUserIds = userIds.map(user => {
          if (user.username === Username) {
            userFound = true;
            return { ...user, userStatus: "Online" };
          }
          return user;
        });
        if (userFound) {
          alert(`Your friend ${Username} is online`);
        }
        return updatedUserIds;
      });
    });

    SignalRService.setOfflineUsersCallback((username) => {
      console.log("A user went offlineeeeeeeeee:", username);
      setUserIds((userIds) =>
        userIds.map(user =>
          user.username === username ? { ...user, userStatus: "Offline" } : user
        )
      );
    });

    SignalRService.setIncrementUnseenMessagesCallback((username, seen) => {
      if (seen === null) {
        setUnseenMessages((unseenMessages) => ({
          ...unseenMessages,
          [username]: (unseenMessages[username] || 0) + 1,
        }));
      } else {
        setUnseenMessages((unseenMessages) => ({
          ...unseenMessages,
          [username]: 0,
        }));
      }
    });

    SignalRService.setSortChatsCallback((Username, Timestamp) => {
      console.log("Invoked SetSortChatsCallbackkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
      console.log("All Messagessssss:", allMessages);
      setUserIds((userIds) => {
        const getLastMessageTime = (username) => {
          if (username === Username) {
            return new Date(Timestamp).getTime();
          } else {
            const userMessages = allMessages[username];
            if (!userMessages) return 0;

            const dateKeys = Object.keys(userMessages).sort();
            if (dateKeys.length === 0) return 0;

            const lastDateKey = dateKeys[dateKeys.length - 1];
            const messagesOnLastDate = userMessages[lastDateKey];
            if (!messagesOnLastDate || messagesOnLastDate.length === 0) return 0;

            const lastMessage = messagesOnLastDate[messagesOnLastDate.length - 1];
            if(lastMessage.timestamp === Timestamp){
              if(messagesOnLastDate.length>1){
                return new Date(messagesOnLastDate[messagesOnLastDate.length - 2].timestamp).getTime();
              }
              return 0;
            }
            return new Date(lastMessage.timestamp).getTime();
          }
        };

        const newUserIds = [...userIds].sort((a, b) => {
          const timeA = getLastMessageTime(a.username);
          const timeB = getLastMessageTime(b.username);
          return timeB - timeA;
        });

        console.log("New User Ids :", newUserIds);
        return newUserIds;
      });
    });


  }, [allMessages]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    performActionWhileTyping(newValue);
  };

  const performActionWhileTyping = (value) => {
    if (value.trim() !== '') {
      axios
        .get("http://localhost:5290/GetOtherUsers", { params: { username: value } })
        .then((res) => {
          setUserIds(
            res.data.filter((obj) =>
              obj.username.toLowerCase().includes(value.toLowerCase())
            )
          );
        })
        .catch((err) => console.log(err));
    } else {
      axios
        .get("http://localhost:5290/GetFriends", { params: { userId: host } })
        .then((res) => setUserIds(res.data))
        .catch((err) => console.log(err));
    }
  };

  const showChat = (obj) => {
    const data = {
      userId: host,
      friendId: obj.id
    };
    axios
      .post("http://localhost:5290/AddFriend", data)
      .then((response) => {
        console.log("Posted Successfully", response.data);
      })
      .catch((err) => console.log(err));
    SignalRService.incrementUnseenMessages(host, obj.username, "seen");
    showPerson(obj);
  };

  const handleShow = () => {
    setShow(false);
    setMessage("");
  };

  const getLastMessage = (username) => {
    const userMessages = allMessages[username];
    if (userMessages) {
      const dateKeys = Object.keys(userMessages).sort();

      if (dateKeys.length > 0) {
        const lastDateKey = dateKeys[dateKeys.length - 1];
        const messagesOnLastDate = userMessages[lastDateKey];

        if (messagesOnLastDate && messagesOnLastDate.length > 0) {
          if (messagesOnLastDate[messagesOnLastDate.length - 1].senderId === host) {
            return "sent : " + messagesOnLastDate[messagesOnLastDate.length - 1].message;
          } else {
            return "received : " + messagesOnLastDate[messagesOnLastDate.length - 1].message;
          }
        }
      }
    }
    return '';
  };

  return (
    <div className="chats overflow-auto" style={{ maxHeight: "100%" }}>
      <h1 className="lead fs-3 text-center m-2 mt-4">
        Welcome <i><b>{username}</b></i>..!!
      </h1>
      <div className="ms-2 d-flex align-items-center mt-1">
        <div className="w-100">
          <AiOutlineSearch className="fs-3" />
          <input
            type="search"
            className="w-75 rounded ps-2"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search by userid.."
          />
        </div>
        <CgProfile
          className="me-2 fs-4"
          onClick={() => setShowModal(!showModal)}
          style={{ cursor: "pointer" }}
        />
      </div>
      <hr />
      <p className="lead ms-2">Your Chats</p>
      <hr className="w-50 ms-1 m-0" />
      <div className="" style={{ position: "relative" }}>
        {userIds?.map(
          (obj) =>
            obj.id !== host && (
              <React.Fragment key={obj.id}>
                <NavLink
                  onClick={() => showChat(obj)}
                  className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link"
                >
                  <p className="lead ms-2 text-white fs-4 d-inline"> {obj.nickname} </p>
                  <p className="lead ms-2 text-white fs-4 d-inline"> {obj.userStatus} </p>
                  <p className="lead ms-2 text-white fs-4 d-inline"> {unseenMessages[obj.username]} </p>
                  <p className="lead ms-2 text-white fs-6 d-inline ms-auto mt-5 mb-0">
                    {getLastMessage(obj.username)}
                  </p>
                  <p className="lead ms-2 text-white fs-6 d-inline ms-auto mt-5 mb-0">
                    {obj.username}
                  </p>
                </NavLink>
                <hr className="ms-1 w-75 m-0" />
              </React.Fragment>
            )
        )}
      </div>

      {show && (
        <div
          className="d-inline d-flex p-0 bg-secondary"
          style={{ position: "absolute", bottom: "0", left: "1rem" }}
        >
          <p className="lead ms-2"> {message} </p>
          <AiFillCloseCircle className="fs-4" onClick={handleShow} />
        </div>
      )}

      {/* <EditProfile show={showModal} setShow={setShowModal} /> */}
    </div>
  );
}

export default AllChats;
