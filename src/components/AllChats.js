import axios, { all } from "axios";
import React, { useEffect, useState,useContext} from "react";
import { AiFillCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
import SignalRService from "./SignalRService";
import { UserContext } from './UserContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {Button,Icons,Modal,Form}from 'react-bootstrap';
import EditProfile from './EditProfile.js';

function AllChats({ show, setShow, message, setMessage, person,showPerson,grpperson,showGrpPerson, userIds, setUserIds, allMessages, 
                  unseenMessages, setUnseenMessages ,allGMessages,setAllGMessages,allGro,setAllGro,fulldet,setFullDet
                ,profilenickname,setProfileNickName,un,setUN}) {
  const [host, setHost] = useState("");  
  const [username, setUsername] = useState("");
  const [inputValue, setInputValue] = useState('');

  //Selected Chat color
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChatStyle = {
    backgroundColor: '#007bff', // Highlight background
    color: 'white', // Text color for active chat
    padding: '10px',
    borderRadius: '5px',
  };

  const inactiveChatStyle = {
    backgroundColor: 'transparent',
    color: '#000', // Default text color for inactive chat
    padding: '10px',
  };

  //Profile Nickname Updation
  const [showoverlay, setShowOverlay] = useState(false);
  const [tar,settar]=useState(null);
  const abcd=(ev)=>{
    setShowOverlay(!showoverlay);
    settar(ev.target)
  }
  const [editingUser, setEditingUser] = useState('');

  //Handle user group click
  const { user, setUser } = useContext(UserContext);
  let [usergroups,setUserGroups]=useState([]);
  let [joingroup,setJoinGroup]=useState("");
  let [juser,setJuser]=useState([]);
  let [jmsgs,setJmsgs]=useState([]);  

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [createg, setCreateG] = useState(""); // State for group name
  const [setpic, setPic] = useState("");

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

  useEffect(() => {
    SignalRService.setEditProfileCallback((username, newNickname,userId) => {
      console.log("Last step we havepppppp",username,newNickname,person)      
      setUserIds((userIds) => {
        const updatedUserIds = userIds.map(user => 
          user.username === username ? { ...user, nickname: newNickname } : user
        );
        console.log("Updated userIds", updatedUserIds);
        return updatedUserIds;
      });
      console.log("OYYYYYYYYYYY",userIds,un);
      setUN((x)=>{
        return {...x,[userId]:newNickname}
      })
      showPerson((prevperson)=>{
        return prevperson.username===username ? {...prevperson,nickname:newNickname} : prevperson;
      })
     
      //Api to update in database
      axios
        .get(`http://localhost:5290/Chat/EditProfile?username=${username}&newNickname=${newNickname}'`)
        .then((res) => {
          console.log("Updated profile in backend")
        })
        .catch((err) => console.log(err));
    });

    SignalRService.setCreateGroupMessageCallback( (groupName,users,picture) => {
      console.log("At last for updating--",groupName,users,picture,localStorage.getItem("username"))
      setAllGMessages( (allGMessages) =>{
        const updatedMessages={...allGMessages};
        if (!updatedMessages[groupName] && users.includes(localStorage.getItem("username"))) {
          updatedMessages[groupName] = {};
        }
        console.log('New updated one--',updatedMessages,users,localStorage.getItem("username"))
        return updatedMessages;
      })
    })

    SignalRService.setaddFriendToGroupMessageCallback( async(groupName,frnd,matter) => {
      SignalRService.addme(groupName);
      console.log("At last for updating--",groupName,frnd,localStorage.getItem("username"))
      try {
        var biod=await axios.get(`http://localhost:5290/Chat/FullDetOfGroup?groupname=${groupName}`)
        setFullDet((prev)=>{
          const temp={...prev};
          if(localStorage.getItem("username")===frnd){
            return{...temp,[groupName]:biod.data}
          }
          return temp;
        })
        console.log("We have content here bro--------",matter)
        setAllGMessages( (allGMessages) =>{
          const updatedMessages={...allGMessages};
          if (!updatedMessages[groupName] && localStorage.getItem("username")===frnd) {
            updatedMessages[groupName] = matter;
          }
          console.log('New updated one--',updatedMessages,matter,localStorage.getItem("username"))
          return updatedMessages;
        })
      }
      catch(error){
        console.log("Error adding frnd at allchats 181")
      }
    })
  }, [allGMessages,setUserIds,setAllGMessages]);

  
  const handleNicknameSubmit =(nickname) => {
    console.log("Received nickname:", username,nickname,person);
    SignalRService.editProfile(username,nickname,host);    
  };


  const handleShowGroupModal=()=> setShowGroupModal(true);
  const handleCloseGroupModal=()=>setShowGroupModal(false);
  const handleGroupSubmit=()=>setShowGroupModal(false);

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

  //When clicked On User Chat
  const showChat = (obj) => {
    setActiveChatId(obj.id);
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

  function decryptmessage(encryptedMessage, userid) {
    let decryptedMessage = '';
    for (let i = 0; i < encryptedMessage.length; i++) {
      let charCode = encryptedMessage.charCodeAt(i) ^ userid.charCodeAt(i % userid.length);
      decryptedMessage += String.fromCharCode(charCode);
    }
    return decryptedMessage;
}

  //When clicked On Group Chat
  const groupChat=(gobj)=>{
    setActiveChatId(gobj.name);
    setUser({ ...user, userType: "group" });
    console.log("Have------",user,gobj,fulldet)
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
      })     
    SignalRService.addme(gobj.name)
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
          console.log("Greater than 1111111111",messagesOnLastDate)
          if (messagesOnLastDate[messagesOnLastDate.length - 1].senderId === host) {
            return "sent : " + decryptmessage(messagesOnLastDate[messagesOnLastDate.length - 1].message,host);
            //return "sent : " + messagesOnLastDate[messagesOnLastDate.length - 1].message;
          } else {
            console.log("OH         pilot uu",messagesOnLastDate[messagesOnLastDate.length - 1],messagesOnLastDate[messagesOnLastDate.length - 1].message)
            return "received : " + decryptmessage(messagesOnLastDate[messagesOnLastDate.length - 1].message,person.id);
            //return "received : " + messagesOnLastDate[messagesOnLastDate.length - 1].message;
          }
        }
      }
    }
    return '';
  };
  
  async function addurfrnd(group){
    const frndname = prompt("Enter frnd name :");
    console.log('groupname:',group.name,'Friendname:',frndname);    
    const fdata={username:frndname,groupname:group.name}
    // axios
    //   .get("http://localhost:5290/Chat/GetUserOfGroup",{params:{groupname:fdata.groupname}})
    //   .then((res)=>{
    //     setJuser(res.data)
    //     console.log("In Getusersofgroup ",fdata.groupname,juser)
    // })
    setJmsgs(allGMessages[fdata.groupname])
    // axios
    //   .post(`http://localhost:5290/Chat/AddUsersToGroup?groupname=${group.name}&frnd=${frndname}`)
    //   .then((res) => {
    //     console.log("Adding user to group",group.name,frndname);
    //   })
    //   .catch((err) => console.log(err));    
    const response=await axios.get(`http://localhost:5290/Chat/FullDetOfGroup?groupname=${group.name}`)
    const allusers=response.data.users;
    SignalRService.addFriend(group.name,frndname,allGMessages[group.name],allusers)
  }
  
  function grandomid() {
    // Generate a random UUID
    return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  } 

  function createGroup() {    
    axios
      .get(`http://localhost:5290/Chat/GetAllGrps?username=${username}`)
      .then((res) => {
        const existingGroup = res.data.find((group) => group.name === createg);
        if (existingGroup) {
          alert("Group name already exists. Please choose a different name.");
        } else {          
          const gwhat=grandomid();
          console.log("New group super",gwhat,createg,username,setpic,fulldet);
          let ggg={id:gwhat,name:createg,users:[username],messages:[],picUrl:setpic}
          setFullDet((prev)=>{
            return{...prev,[createg]:ggg}
          })
          axios
          .post("http://localhost:5290/Chat/CreateGroup",ggg,{headers: {'Content-Type': 'application/json'}})
          .then((res) => {
            console.log("Hey",ggg)
            setUserGroups([...usergroups,ggg]);          
            console.log('This is the group',usergroups);
            console.log("Created Successfully")            
          })
          .catch((error) => 
            console.error('Error:', error.response ? error.response.data : error.message)
          );          
        }
      })
      .catch((e)=>console.log(e)); 

      console.log("First ma ",username,createg,setpic);
      SignalRService.createGrouppp(username,createg,setpic);
      setCreateG('');
      setPic('');
      handleCloseGroupModal();
  }

  //Join Group
  // function joinGroup(){
  //   const gname = prompt("Enter group name to joinnnnnn:");
  //   console.log('grpname',gname,username);    
  //   const data={username:username,groupname:gname}
  //   // axios
  //   //   .get("http://localhost:5290/Chat/GetUserOfGroup",{params:{groupname:data.groupname}})
  //   //   .then((res)=>{
  //   //     setJuser(res.data)
  //   //     console.log("In Getusersofgroup ",data.groupname,juser)
  //   //   })
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
          onClick={abcd}   
          style={{ cursor: "pointer" }}
        />
      </div>
      <hr />
      {/* Create Group Button */}
      <div className="button-container mt-auto">
        <div className="d-flex justify-content-between align-items-center m-3">
          <Button className="btn me-3" onClick={handleShowGroupModal}>
            Create<i class="bi bi-collection"></i>
          </Button>
          {/* <Button className="btn me-3" onClick={joinGroup}>
            Join<i class="bi bi-collection-fill"></i>
          </Button> */}
        </div>
      </div>

      <p className="lead ms-2">Your Chats</p>
      <hr className="w-50 ms-1 m-0" />
      {/* User online offline indicator */}
      <style>
        {`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; }
        }`}
      </style>

      <div className="" style={{ position: "relative" }}>
        {/* Display all users */}
        {userIds?.map(
          (obj) =>
            obj.id !== host && (
              <React.Fragment key={obj.id}>
                <NavLink
                  onClick={() => showChat(obj)}
                  className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link"
                  style={{position:"relative",...(activeChatId === obj.id ? activeChatStyle : inactiveChatStyle)}}
                >
                  <p className="ms-2 text-white " style={{fontSize:"30px"}}> {obj.nickname} </p>
                  {/* <p className="lead ms-2 text-white fs-4 d-inline"> {obj.userStatus} </p> 
                    <p className="lead ms-2 text-white fs-4 d-inline"> {unseenMessages[obj.username]} </p>
                  */}
                  <div style={{width:"10px", height:"10px", borderRadius:"50%", marginLeft:"10px", 
                    backgroundColor:obj.userStatus==="offline"?'red':'green', animation:obj.userStatus==='offline'?'blink 1s infinite':'none',display: 'inline-block',}}>
                  </div>

                  {unseenMessages[obj.username]>0 && (
                    <div
                      style={{width: '24px',height: '24px',backgroundColor: 'blue',color: 'white',textAlign: 'center',lineHeight: '10px',
                      transform: 'rotate(45deg)',position: 'absolute',right: '10px',top: '50%',marginTop: '-12px',
                      display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                        <span style={{transform: 'rotate(-45deg)',display: 'block'}}>
                          {unseenMessages[obj.username]}
                        </span>                
                    </div>
                  )}
                  
                  <p className="ms-2 text-white d-inline ms-auto mt-5 mb-0" style={{ fontSize: "30px" }}>
  {getLastMessage(obj.username)}
</p>
<p className="ms-2 text-white d-inline ms-auto mt-5 mb-0" style={{ fontSize: "30px" }}>
  {obj.username}
</p>


                </NavLink>
                <hr className="ms-1 w-75 m-0" />
              </React.Fragment>
            )
        )}

        {/* Display all Groups */}
        {Object.entries(allGMessages)?.map(([groupName, group]) => (          
          <div key={groupName} className="mt-3 d-flex justify-content-between align-items-center" style={activeChatId === groupName ? activeChatStyle : inactiveChatStyle}>
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

      <Modal show={showGroupModal} onHide={handleCloseGroupModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="createg">
              <Form.Label>Group Name</Form.Label>
              <Form.Control type="text" placeholder="Enter group name" value={createg} onChange={(e) => setCreateG(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="setpic">
              <Form.Label>Picture URL</Form.Label>
              <Form.Control type="text" placeholder="Enter picture URL" value={setpic} onChange={(e) => setPic(e.target.value)} />
            </Form.Group>
            <Button variant="primary" onClick={createGroup}>Create Group</Button>
            <Button variant="primary" onClick={handleCloseGroupModal}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {showoverlay && <EditProfile showoverlay={showoverlay} tar={tar} setShowOverlay={setShowOverlay} onSubmit={handleNicknameSubmit} />}
    </div>
      
    
  );
}

export default AllChats;
