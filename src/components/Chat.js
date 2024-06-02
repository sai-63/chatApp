  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import AllChats from "./AllChats";
  import Conversation from "./Conversation";
  import EmptyChat from "./EmptyChat";
  import { UserProvider } from "./UserContext";
  import { set } from "react-hook-form";

  function Chat() {
    let [person, showPerson] = useState({});
    let [grpperson,showGrpPerson]=useState({});

    const navigate = useNavigate();
    let [show, setShow] = useState(false);
    let [message, setMessage] = useState("");
    const [userIds, setUserIds] = useState([]);
    const [friendIds, setFriendIds] = useState([]);
    const host = localStorage.getItem("userId");
    const [allMessages,setAllMessages] = useState({});
    const [unseenMessages,setUnseenMessages] = useState({});
    const [unseenGMessages,setUnseenGMessages] = useState({});
    const [lastMessages,setLastMessages] = useState({});

    const [allGMessages,setAllGMessages]=useState({});
    const [allgrps,setAllGrps]=useState([])
    const [un,setUN]=useState(null)
    const [fulldet,setFullDet]=useState({})

    useEffect(() => {
      if (host) {        
        // axios
        //   .get("http://localhost:5290/GetFriends", { params: { userId: host } })
        //   .then((res) => {
        //     const friendIds = res.data;
        //     setUserIds(friendIds);
    
        //     const fetchMessagesForUsers = async () => {
        //       console.log("Chat frnds userids -",userIds,friendIds)
        //       const newAllMessages = {};
        //       const newUnseenMessages = {};
        //       const newAllGMessages = {};
        //       const ouno={}         

        //       for (const user of friendIds) {
        //         try {
        //           const response = await axios.get("http://localhost:5290/Chat/GetMessagesSenderIdUserId", {
        //             params: {
        //               senderId: host,
        //               receiverId: user.id,
        //             },
        //           });
    
        //           let unseenCount = 0;
        //           for (const messageList of Object.values(response.data)) {
        //             for (const message of messageList) {
        //               if (!message.isRead && message.receiverId === host) {
        //                 unseenCount++;
        //               }
        //             }
        //           }
        //           newAllMessages[user.username] = response.data;
        //           newUnseenMessages[user.username] = unseenCount;
        //         } catch (error) {
        //           console.log(`Error fetching messages for user ${user.username}:`, error);
        //         }
        //       }
    
        //       setAllMessages(newAllMessages);
        //       setUnseenMessages(newUnseenMessages);
              
        //       setUserIds((userIds) => {
        //         const getLastMessageTime = (username) => {
        //           const userMessages = newAllMessages[username];
        //           if (!userMessages) return 0;
    
        //           const dateKeys = Object.keys(userMessages).sort();
        //           if (dateKeys.length === 0) return 0;
    
        //           const lastDateKey = dateKeys[dateKeys.length - 1];
        //           const messagesOnLastDate = userMessages[lastDateKey];
        //           if (!messagesOnLastDate || messagesOnLastDate.length === 0) return 0;
    
        //           const lastMessage = messagesOnLastDate[messagesOnLastDate.length - 1];
        //           return new Date(lastMessage.timestamp).getTime();
        //         };
    
        //         const newUserIds = [...userIds].sort((a, b) => {
        //           const timeA = getLastMessageTime(a.username);
        //           const timeB = getLastMessageTime(b.username);
        //           return timeB - timeA;
        //         });
    
        //         console.log("New User Ids :", newUserIds);
        //         return newUserIds;
        //       });

        //       try{                
        //         const neednameres= await axios.get("http://localhost:5290/Chat/Getnamebyid",{params:{userId:host}})
        //         const needname=neednameres.data;
        //         console.log("Have username as ",needname)
        //         try{
        //           const resss=await axios.get("http://localhost:5290/Chat/GetUserGroupMessages",{params:{username:needname}});
        //           for(const i of Object.values(resss.data)){
        //             newAllGMessages[i.name]=i
        //           }
        //         }catch(error){
        //           console.log("Error getting grpmsgs",error);
        //         }
        //         try{
        //           const unn=await axios.get("http://localhost:5290/Chat/Getnameforid")
        //           ouno=unn.data
        //           console.log("We get un as in chat file ",unn.data)
        //         }catch(error){
        //           console.log("Error getting uids and unames")
        //         }
        //       }
        //       catch(error){console.log("error during username")}
        //       console.log("Chat- allmessages ",allMessages)
        //       console.log("Chat- grpmsgs as ",newAllGMessages)
        //       console.log("CHat - un",un,ouno)
        //       setAllGMessages(newAllGMessages);
        //       setUN(ouno);
        //     };
    
        //     fetchMessagesForUsers();
        //   })
        //   .catch((err) => console.log(err));
        const fetchFriends = async () => {
          try {
            const res = await axios.get("http://localhost:5290/GetFriends", {
              params: { userId: host },
            });
            const friendIds = res.data;
            setUserIds(friendIds);
  
            const fetchMessagesForUsers = async () => {
              console.log("Chat friends userIds -", userIds, friendIds);
              const newAllMessages = {};
              const newUnseenMessages = {};
  
              for (const user of friendIds) {
                try {
                  const response = await axios.get(
                    "http://localhost:5290/Chat/GetMessagesSenderIdUserId",
                    {
                      params: {
                        senderId: host,
                        receiverId: user.id,
                      },
                    }
                  );
  
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
                  console.log(
                    `Error fetching messages for user ${user.username}:`,
                    error
                  );
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
                  if (
                    !messagesOnLastDate ||
                    messagesOnLastDate.length === 0
                  )
                    return 0;
  
                  const lastMessage =
                    messagesOnLastDate[messagesOnLastDate.length - 1];
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
              console.log("Group hostname - ",hostname.data)
              const hostgrps=await axios.get(`http://localhost:5290/Chat/Getallgrps?username=${hostname.data}`)
              console.log("Host is in groups - ",hostgrps.data)
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
              try {
                // const neednameres = await axios.get(
                //   "http://localhost:5290/Chat/Getnamebyid",
                //   { params: { userId: host } }
                // );
                // const needname = neednameres.data;
                // console.log("Have username as ", needname);
                // try {
                //   const resss = await axios.get(
                //     "http://localhost:5290/Chat/GetUserGroupMessages",
                //     { params: { username: needname } }
                //   );
                //   for (const i of Object.values(resss.data)) {
                //     newAllGMessages[i.name] = i;
                //   }
                // } catch (error) {
                //   console.log("Error getting group messages", error);
                // }                
              } catch (error) {
                console.log("error during username");
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
            showGrpPerson={showGrpPerson}
            userIds={userIds}
            setUserIds={setUserIds}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            allGMessages={allGMessages}
            fulldet={fulldet}        
            setAllGMessages={setAllGMessages}          
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
