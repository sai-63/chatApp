import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AllChats from "./AllChats";
import Conversation from "./Conversation";
import EmptyChat from "./EmptyChat";
import { UserProvider } from "./UserContext";

function Chat() {
  let [person, showPerson] = useState({});
  let [grpperson,showGrpPerson]=useState({});

  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [message, setMessage] = useState("");
  const [userIds, setUserIds] = useState([]);
  const host = localStorage.getItem("userId");
  const [allMessages,setAllMessages] = useState({});
  const [unseenMessages,setUnseenMessages] = useState({});
  const [lastMessages,setLastMessages] = useState({});

  //All group messages and their names
  const [allGMessages,setAllGMessages]=useState({});
  const [allgrps,setAllGrps]=useState([])
  const [un,setUN]=useState(null)
  const [fulldet,setFullDet]=useState({})
  const [allGro,setAllGro]=useState([]);

  useEffect(()=>{
    if(host===null){
      navigate("/login");
    }
  },[])

  useEffect(() => {
    //Store all prev messages in allMessages and allGMessages
    if (host) {
      const fetchFriends = async () => {        
        try {
          const res = await axios.get("http://localhost:5290/GetFriends", {
            params: { userId: host },
          });
          const friendIds = res.data;
          console.log("Current user friends are--",host,friendIds,res.data)
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
              //showPerson(newUserIds[0]);
              return newUserIds;
            });
          };

          const fetchGroupMessages = async () => {
            const newAllGMessages = {};
            const newUnseenGMessages={}
            let ouno = null;
            const newFulldet={}
            try {
              const unn = await axios.get(
                "http://localhost:5290/Chat/Getnameforid"
              );
              ouno = unn.data;
              console.log("We get un as in chat file ", unn.data);
            } catch (error) {
              console.log("Error getting uids and usernames");
            }
            const hostname = await axios.get("http://localhost:5290/GetUsernameById", {params: { userId: host }})
            //console.log("Group hostname - ",hostname.data)
            //const hostgrps=await axios.get(`http://localhost:5290/Chat/Getallgrps?username=${hostname.data}`)
            const hostgrps=await axios.get(`http://localhost:5290/Chat/Getallgrps?username=${hostname.data}`)
            console.log("Host is in groups - ",hostgrps.data)              
            setAllGro(hostgrps.data);
            localStorage.setItem("allgg",hostgrps.data)
            console.log("ALL GROUPS OF USER",localStorage.getItem("allgg"))
            for (const i of hostgrps.data) {
                const response = await axios.get(
                  `http://localhost:5290/Chat/GetUserGroupMessages?groupname=${i}`
                )
                let unseenGCount = 0;
                for (const messageList of Object.values(response.data)) {
                  for (const message of messageList) {
                    if (!message.isRead && message.receiverId === host) {
                      unseenGCount++;
                    }
                  }
                }
                newUnseenGMessages[i.name] = unseenGCount;
                const res=await axios.get(`http://localhost:5290/Chat/FullDetOfGroup?groupname=${i}`)
                newAllGMessages[i]=response.data
                newFulldet[i]=res.data
            }
            console.log("Chat- allMessages ", allMessages);
            console.log("Chat- group messages as ", newAllGMessages);
            console.log("Chat - un", un, ouno);
            //setAllGMessages(newAllGMessages);
            console.log("setting groups - ",hostgrps.data)
            setAllGrps(hostgrps.data)
            setAllGMessages(newAllGMessages)
            setFullDet(newFulldet)
            setUN(ouno);
          };

          await fetchMessagesForUsers();
          await fetchGroupMessages();
        } catch (err) {
          console.log(err);
        }
      };

      fetchFriends();
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
          grpperson={grpperson}
          showGrpPerson={showGrpPerson}
          userIds={userIds}
          setUserIds={setUserIds}
          allMessages={allMessages}
          setAllMessages={setAllMessages}
          allGMessages={allGMessages}
          setAllGMessages={setAllGMessages}
          fulldet={fulldet}                 
          unseenMessages={unseenMessages}
          setUnseenMessages={setUnseenMessages}
          allGro={allGro}
          setAllGro={setAllGro}
        />
      </div>

      <div
        className={`col col-md-8 ${
          person.userid ? "d-block" : "d-none"
        } d-md-block`}
        style={{ maxHeight: "100%" }}
      >
        {(person.id || grpperson.id)? (
          <Conversation
            setShow={setShow}
            setMessage={setMessage}
            person={person}
            showPerson={showPerson}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            allGMessages={allGMessages}
            setAllGMessages={setAllGMessages}
            un={un}
            setUN={setUN}
            grpperson={grpperson}
            showGrpPerson={showGrpPerson}
            allGro={allGro}
            setAllGro={setAllGro}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default ()=>(
  <UserProvider>
    <Chat />
  </UserProvider>
);
