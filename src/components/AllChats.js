import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
// import EditProfile from "./EditProfile";
import {Button,Icons}from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function AllChats({ show, setShow, message, setMessage, showPerson,showGrpPerson,isgrp,showIsGrp,isuser,showIsUser,grpmsgs,setGrpMsgs}) {
  let [host, setHost] = useState("");
  let [showModal, setShowModal] = useState(false);
  let [userids, setUserId] = useState([]);
  let [username,setUsername] = useState('');
  let [state,setState] = useState(false);
  const [inputValue, setInputValue] = useState('');

  //GRoups CoDe
  let [usergroups,setUserGroups]=useState([]);
  let [joingroup,setJoinGroup]=useState("");
  let [juser,setJuser]=useState([]);
  let [jmsgs,setJmsgs]=useState([]);
  let [whatgrp,setWhatGrp]=useState("");

  useEffect(()=>{
    setHost(localStorage.getItem("userId"));
    setUsername(localStorage.getItem("username"))
  },[]);

  useEffect(() => {
    axios
      .get("http://localhost:5290/GetFriends",{params:{id:host}})
      .then((res) => setUserId(res.data))
      .catch((err) => console.log(err));
  }, [host,state]);

  //Gets groups updated for every 3 sec
  useEffect(() => {
    const interval=setInterval(() => {
    axios
      .get("http://localhost:5290/Chat/GetUserGroups",{params:{username:username}})
      .then((res) => setUserGroups(res.data))
      .catch((err) => console.log(err));
    },2000);
    return ()=>clearInterval(interval);
  },[username]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Perform action when input is changing
    performActionWhileTyping(newValue);
  };

  const performActionWhileTyping = (value) => {
    // Check if input is not empty
    if (value.trim() !== '') {
      // Perform action when input is changing
      console.log('Performing action while typing...');
      axios
      .get("http://localhost:5290/GetOtherUsers",{params:{id:host}})
      .then((res) =>
        setUserId(
          res.data.filter((obj) =>
            obj.id.toLowerCase().includes(value.toLowerCase())
          )
        )
      )
      .catch((err) => console.log(err));
    } else {
      // Perform action when input is empty
      console.log('Input field is empty');
      axios
      .get("http://localhost:5290/GetFriends",{params:{id:host}})
      .then((res) => setUserId(res.data))
      .catch((err) => console.log(err));
    }
  };

  // function handleChange(event) {
  //   axios
  //     .get("http://localhost:5290/GetOtherUsers",{params:{id:host}})
  //     .then((res) =>
  //       setUserId(
  //         res.data.filter((obj) =>
  //           obj.id.toLowerCase().includes(event.target.value.toLowerCase())
  //         )
  //       )
  //     )
  //     .catch((err) => console.log(err));
  //   setState(!state);
  // }

  const showChat = (obj) => {
    console.log("Object Id ----------:  ",host,"  ",obj.id)
    const data={
      userId:host,
      friendId:obj.id
    }
    axios
    .post("http://localhost:5290/AddFriend",data)
    .then((response)=>{
      console.log("Posted Successfullyyyyyyyyyyyyyyyyyyyy")
      console.log(response.data)
    })
    .catch((err) => console.log(err));
    console.log("After posttttttttt")
    showPerson(obj);
  };

  //Group Chat setting function
  const groupChat=(gobj)=>{
    showGrpPerson(gobj);
    //showIsGrp("group");
    //console.log("In allchats group now it is",isgrp)
    console.log("From clicking on group object we got",gobj);
    console.log("group id:",whatgrp,gobj.messages);    
  }

  function handleShow() {
    setShow(false);
    setMessage("");
  }

  //Groups CODE
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
    axios
      .get("http://localhost:5290/Chat/GetGroupMessages",{params:{groupname:data.groupname}})
      .then((res)=>{
        setJmsgs(res.data)
        console.log("In Getgroupmessages ",data.groupname)
      })
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

  //To add your friend to a group
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
    axios
      .get("http://localhost:5290/Chat/GetGroupMessages",{params:{groupname:fdata.groupname}})
      .then((res)=>{
        setJmsgs(res.data)
        console.log("In Getgroupmessages ",fdata.messages)
    })
    axios
      .post("http://localhost:5290/Chat/AddUsersToGroup", fdata)
      .then((res) => {
        console.log("User added to group",joingroup);
        const fnewjoining={id:res.data.id,name:fdata.name,users:juser,messages:jmsgs}
        setUserGroups([...usergroups,fnewjoining])
      })
      .catch((err) => console.log(err));    
  }

  return (
    <div className="chats overflow-auto" style={{ maxHeight: "100%" }}>
      <h1 className="lead fs-3 text-center m-2 mt-4">
        {" "}
        Welcome{" "}
        <i>
          <b>{username}</b>
        </i>
        ..!!
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
      <div className="d-flex justify-content-around">

      {/* Group Buttons */}
      <Button onClick={createGroup} className="me-2">Create Group<i class="bi bi-collection"></i></Button>
      <Button onClick={joinGroup} className="me-2">Join Group<i class="bi bi-collection-fill"></i></Button></div>

      <hr className="w-50 ms-1 m-0" />
      <div className="" style={{ position: "relative" }}>
        {userids?.map(
          (obj) =>
            obj.id !== host && (
              <>
                <NavLink
                  onClick={() => {showIsUser(true);showIsGrp(false);showChat(obj);}}
                  className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link"
                >
                  <p className="lead ms-2 text-white fs-4 d-inline"> {obj.username} </p>
                  <p className="lead ms-2 text-white fs-6 d-inline ms-auto mt-5 mb-0">
                    {obj.id}
                  </p>
                </NavLink>
                <hr className="ms-1 w-75 m-0" />
              </>
            )
        )}

        {/* Groups Displaying Code  */}
        {usergroups?.map((group) => (
        <div key={group.name} className="mt-3 d-flex justify-content-between align-items-center">

          <div>
            <NavLink onClick={()=> {showIsGrp(true);showIsUser(false);groupChat(group);setWhatGrp(group.name)} } className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link">
              <p className="lead ms-2 text-white fs-4 d-inline"> {group.name} </p>              
            </NavLink>            
          </div>

          <div><Button onClick={()=>addurfrnd(group)}>Add ur frnd</Button></div>
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
