import axios, { all } from "axios";
import React, { useEffect, useState,useContext} from "react";
import { AiFillCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
import SignalRService from "./SignalRService";
import { UserContext } from './UserContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {Button,Icons}from 'react-bootstrap';

function AllChats({ show, setShow, message, setMessage, person,showPerson,grpperson,showGrpPerson, userIds, setUserIds, allMessages, 
                  unseenMessages, setUnseenMessages ,allGMessages,setAllGMessages,allGro,setAllGro,fulldet}) {
  const [host, setHost] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [inputValue, setInputValue] = useState('');

  //Handle user group click
  const { user, setUser } = useContext(UserContext);
  let [usergroups,setUserGroups]=useState([]);
  let [joingroup,setJoinGroup]=useState("");
  let [juser,setJuser]=useState([]);
  let [jmsgs,setJmsgs]=useState([]);  

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    setHost(userId);
    setUsername(username);
    console.log("he",userIds)
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
    setUser({ ...user, userType: "user" });
    console.log("Have------",user)
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

  //Group CHat
  const groupChat=(gobj)=>{
    setUser({ ...user, userType: "group" });
    console.log("Have------",user)
    localStorage.setItem("gname",gobj.name)
    console.log("Bro u clicked group",localStorage.getItem("gname"))
    console.log("We got on clicking grp is ",gobj,gobj.id)    
    localStorage.setItem("receiver",gobj.id)
    showGrpPerson(gobj)
    console.log("set gmsg at allchats ",gobj.messages)
    axios
      .get("http://localhost:5290/Chat/Getgroupid",{params:{gname:gobj.name}})
      .then((res)=>{
        console.log("Hooray",res.data);        
        localStorage.setItem("groupid",res.data);
      }
    )    
  }

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

  //GROUPS
  // function createGroup() {
  //   const groupName = prompt("Enter group name:");
  //   axios
  //     .get("http://localhost:5290/Chat/GetAllGroups")
  //     .then((res) => {
  //       const existingGroup = res.data.find((group) => group.name === groupName);
  //       if (existingGroup) {
  //         alert("Group name already exists. Please choose a different name.");
  //       } else {
  //         console.log("New group super");
  //         axios
  //         .post("http://localhost:5290/Chat/CreateGroup", {
  //           name: groupName,
  //           users: [username],
  //           messages: [],
  //         })
  //         .then((res) => {
  //           const newGroup={ id: res.data.id, name: groupName, users: [username], messages: []};
  //           setUserGroups([
  //             ...usergroups,newGroup]);
  //             console.log('This is the group',usergroups);
  //         console.log("Created Successfully")
  //         })
  //         .catch((err) => console.log(err));
  //       }
  //     })
  //     .catch((e)=>console.log(e));      
  // }

  // //Join Group
  // function joinGroup(){
  //   const gname = prompt("Enter group name to joinnnnnn:");
  //   console.log('grpname',gname,username);    
  //   const data={username:username,groupname:gname}
  //   axios
  //     .get("http://localhost:5290/Chat/GetUserOfGroup",{params:{groupname:data.groupname}})
  //     .then((res)=>{
  //       setJuser(res.data)
  //       console.log("In Getusersofgroup ",data.groupname,juser)
  //     })
  //   // axios
  //   //   .get("http://localhost:5290/Chat/GetGroupMessages",{params:{groupname:data.groupname}})
  //   //   .then((res)=>{
  //   //     setJmsgs(res.data)
  //   //     console.log("In Getgroupmessages ",data.groupname)
  //   //   })
  //   setJmsgs(allGMessages[data.groupname])
  //   if(gname&&username){
  //     axios
  //       .post("http://localhost:5290/Chat/AddUsersToGroup", data)
  //       .then((res) => {
  //         console.log("User added to group",joingroup);
          
  //         const newjoining={id:res.data.id,name:gname,users:juser,messages:jmsgs}
  //         setUserGroups([...usergroups,newjoining])
  //       })
  //       .catch((err) => console.log(err));
  //   }
  // }
  function addurfrnd(group){
    const frndname = prompt("Enter frnd name :");
    console.log('grpname',group.name,frndname);    
    const fdata={username:frndname,groupname:group.name}
    axios
      .get("http://localhost:5290/Chat/GetUserOfGroup",{params:{groupname:fdata.groupname}})
      .then((res)=>{
        setJuser(res.data)
        console.log("In Getusersofgroup ",fdata.groupname,juser)
    })
    // axios
    //   .get("http://localhost:5290/Chat/GetGroupMessages",{params:{groupname:fdata.groupname}})
    //   .then((res)=>{
    //     setJmsgs(res.data)
    //     console.log("In Getgroupmessages ",fdata.messages)
    // })
    setJmsgs(allGMessages[fdata.groupname])
    axios
      .post("http://localhost:5290/Chat/AddUsersToGroup", fdata)
      .then((res) => {
        console.log("User added to group",joingroup);
        const fnewjoining={id:res.data.id,name:fdata.name,users:juser,messages:jmsgs}
        setUserGroups([...usergroups,fnewjoining])
      })
      .catch((err) => console.log(err));    
  }
  function createGroup() {
    const groupName = prompt("Enter group name:");
    axios
      .get("http://localhost:5290/Chat/GetAllGroups")
      .then((res) => {
        const existingGroup = res.data.find((group) => group.name === groupName);
        if (existingGroup) {
          alert("Group name already exists. Please choose a different name.");
        } else {
          console.log("New group super");
          axios
          .post("http://localhost:5290/Chat/CreateGroup", {
            name: groupName,
            users: [username],
            messages: [],
          })
          .then((res) => {
            const newGroup={ id: res.data.id, name: groupName, users: [username], messages: []};
            setUserGroups([
              ...usergroups,newGroup]);
              console.log('This is the group',usergroups);
          console.log("Created Successfully")
          })
          .catch((err) => console.log(err));
        }
      })
      .catch((e)=>console.log(e));      
  }

  //Join Group
  function joinGroup(){
    const gname = prompt("Enter group name to joinnnnnn:");
    console.log('grpname',gname,username);    
    const data={username:username,groupname:gname}
    axios
      .get("http://localhost:5290/Chat/GetUserOfGroup",{params:{groupname:data.groupname}})
      .then((res)=>{
        setJuser(res.data)
        console.log("In Getusersofgroup ",data.groupname,juser)
      })
    // axios
    //   .get("http://localhost:5290/Chat/GetGroupMessages",{params:{groupname:data.groupname}})
    //   .then((res)=>{
    //     setJmsgs(res.data)
    //     console.log("In Getgroupmessages ",data.groupname)
    //   })
    setJmsgs(allGMessages[data.groupname])
    if(gname&&username){
      axios
        .post("http://localhost:5290/Chat/AddUsersToGroup", data)
        .then((res) => {
          console.log("User added to group",joingroup);
          
          const newjoining={id:res.data.id,name:gname,users:juser,messages:jmsgs}
          setUserGroups([...usergroups,newjoining])
        })
        .catch((err) => console.log(err));
    }
  }

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
      <div className="button-container mt-auto">
        <div className="d-flex justify-content-between align-items-center m-3">
          <Button className="btn me-3" onClick={createGroup}>
            Create<i class="bi bi-collection"></i>
          </Button>
          <Button className="btn me-3" onClick={joinGroup}>
            Join<i class="bi bi-collection-fill"></i>
          </Button>
        </div>
      </div>
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
        {Object.entries(allGMessages)?.map(([groupName, group]) => (          
          <div key={groupName} className="mt-3 d-flex justify-content-between align-items-center">
            <div>
              {console.log('Name and msgs are',groupName,group)}
              <NavLink onClick={()=> groupChat(fulldet[groupName]) } className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link">
                <p className="lead ms-2 text-white fs-4 d-inline"> {groupName} </p>
              </NavLink>
            </div>
            <div><Button onClick={()=>addurfrnd(fulldet[groupName])}><i class="bi bi-person-fill-add"></i></Button></div>
          </div>        
        ))}
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
