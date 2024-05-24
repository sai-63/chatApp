import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AllChats from "./AllChats";
import Conversation from "./Conversation";
import EmptyChat from "./EmptyChat";

function Chat() {
  let [person, showPerson] = useState({});

  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [message, setMessage] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const host = localStorage.getItem("userId");
  const [allMessages,setAllMessages] = useState({});
  const [unseenMessages,setUnseenMessages] = useState({});
  const [lastMessages,setLastMessages] = useState({});

  useEffect(() => {
    if (host) {
      axios
        .get("http://localhost:5290/GetFriends", { params: { userId: host } })
        .then((res) => {
          const friendIds = res.data;
          setUserIds(friendIds);
  
          const fetchMessagesForUsers = async () => {
            const newAllMessages = {};
            const newUnseenMessages = {};
  
            for (const user of friendIds) {
              try {
                const response = await axios.get("http://localhost:5290/Chat/GetMessagesSenderIdUserId", {
                  params: {
                    senderId: host,
                    receiverId: user.id,
                  },
                });
  
                let unseenCount = 0;
                for (const messageList of Object.values(response.data)) {
                  for (const message of messageList) {
                    if (!message.isRead && message.receiverId === host) {
                      unseenCount++;
                    }
                  }
                }
                newAllMessages[user.username] = response.data;
                newUnseenMessages[user.username] = unseenCount;
              } catch (error) {
                console.log(`Error fetching messages for user ${user.username}:`, error);
              }
            }
  
            setAllMessages(newAllMessages);
            setUnseenMessages(newUnseenMessages);
            
            setUserIds((userIds) => {
              const getLastMessageTime = (username) => {
                const userMessages = newAllMessages[username];
                if (!userMessages) return 0;
  
                const dateKeys = Object.keys(userMessages).sort();
                if (dateKeys.length === 0) return 0;
  
                const lastDateKey = dateKeys[dateKeys.length - 1];
                const messagesOnLastDate = userMessages[lastDateKey];
                if (!messagesOnLastDate || messagesOnLastDate.length === 0) return 0;
  
                const lastMessage = messagesOnLastDate[messagesOnLastDate.length - 1];
                return new Date(lastMessage.timestamp).getTime();
              };
  
              const newUserIds = [...userIds].sort((a, b) => {
                const timeA = getLastMessageTime(a.username);
                const timeB = getLastMessageTime(b.username);
                return timeB - timeA;
              });
  
              console.log("New User Ids :", newUserIds);
              return newUserIds;
            });
          };
  
          fetchMessagesForUsers();
        })
        .catch((err) => console.log(err));
    }
  }, [host]);  

  return (
    <div className="web dark row flex-grow-1 m-0 mt-3" style={{ position: "relative" }}>
      <div
        className={`col col-md-4 ${
          person.id ? "d-none" : "d-block"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        <AllChats
          show={show}
          setShow={setShow}
          message={message}
          setMessage={setMessage}
          person={person}
          showPerson={showPerson}
          userIds={userIds}
          setUserIds={setUserIds}
          allMessages={allMessages}
          setAllMessages={setAllMessages}
          unseenMessages={unseenMessages}
          setUnseenMessages={setUnseenMessages}
        />
      </div>

      <div
        className={`col col-md-8 ${
          person.userid ? "d-block" : "d-none"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        {person.id ? (
          <Conversation
            setShow={setShow}
            setMessage={setMessage}
            person={person}
            showPerson={showPerson}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default Chat;
