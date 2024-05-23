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
  const host = localStorage.getItem("userId");
  const [allMessages,setAllMessages] = useState({});
  const [unseenMessages,setUnseenMessages] = useState({});

  useEffect(() => {
    if (host) {
      axios
        .get("http://localhost:5290/GetFriends", { params: { userId: host } })
        .then((res) => {
          setUserIds(res.data);

        })
        .catch((err) => console.log(err));
    }
  }, [host]);

  useEffect(() => {
    const fetchMessagesForUsers = async () => {
      const newAllMessages = {};
      const newUnseenMessages = {};
  
      for (const user of userIds) {
        try {
          const response = await axios.get("http://localhost:5290/Chat/GetMessagesSenderIdUserId", {
            params: {
              senderId: host,
              receiverId: user.id,
            },
          });
  
          // Initialize unseen count for the current user
          let unseenCount = 0;
  
          // Iterate over the values of the response data (lists of messages)
          for (const messageList of Object.values(response.data)) {
            // Iterate over each message in the list
            for (const message of messageList) {
              // Increment unseen count if the message is unread
              if (!message.isRead && message.receiverId===host) {
                unseenCount++;
              }
            }
          }
  
          // Store all messages
          newAllMessages[user.username] = response.data;
  
          // Store the count of unseen messages
          newUnseenMessages[user.username] = unseenCount;
        } catch (error) {
          console.log(`Error fetching messages for user ${user.username}:`, error);
        }
      }
  
      // Update state with all messages and unseen message counts
      setAllMessages(newAllMessages);
      setUnseenMessages(newUnseenMessages);
      console.log("All Messagessssssssss:",newAllMessages);
      console.log("Unseen Messagessss:",newUnseenMessages);
    };
  
    if (userIds.length > 0) {
      fetchMessagesForUsers();
    }
  
  }, [userIds, host]);
  
  

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
