import * as signalR from '@microsoft/signalr';
import axios from "axios";

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.receiveGroupMessageCallback=null;
    this.receiveCreateGroupMessageCallback=null;
    this.addFriendToGroupMessageCallback=null;
    this.add=null;
    this.removeMessageCallback = null;
    this.removeGrpMessageCallback = null;
    this.editMessageCallback = null;
    this.editGrpMessageCallback = null;
    this.editProfileCallback=null;
    this.readMessageCallback = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.userId = null;
    this.gn=null;
    this.allg=[];
    this.username = null;
    this.onlineUsersCallback = null;
    this.displayOnlineCallback = null;
    this.offlineUsersCallback = null;
    this.displayOfflineCallback = null;
    this.unseenMessagesCallback = null;
    this.sortChatsCallback = null;
    this.userTypingCallback = null;

    window.addEventListener("beforeunload", (event) => {
      if (this.connection) {
        this.userOffline();
        this.connection.invoke("UserClosingTab")
          .catch(err => console.error(err.toString()));
      }
    });

    window.addEventListener("load", () => {
      this.startConnection();
    });
  }

  startConnection() {
    if (this.isConnecting || this.isConnected) return; // Prevent multiple connection attempts

    this.userId = localStorage.getItem("userId");
    this.username = localStorage.getItem("username");
    this.gid=localStorage.getItem("groupid")
    this.gn=localStorage.getItem("gname")
    //this.allgg=localStorage.getItem("allgg")
    //this.allgg= JSON.parse(localStorage.getItem("allgg") || "[]");
    const allggString = localStorage.getItem("allgg");
    this.allg = allggString ? allggString.split(',') : [];
    console.log("All GROUPS----",localStorage.getItem("allgg"),this.allg)
    console.log("Out User connected:",this.userId,"Group id",this.gid);


    if (!this.userId) return;

    this.isConnecting = true;

    //const connectionUrl = `http://localhost:5290/notificationHub?userId=${this.userId}`;
    const connectionUrl = `http://localhost:5290/notificationHub?userId=${this.userId}&allg=${encodeURIComponent(this.allg.join(','))}`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(connectionUrl)
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    this.connection.onreconnecting((error) => {
      console.log(`SignalR connection lost. Attempting to reconnect... Error: ${error}`);
      this.isConnected = false;
      this.userOffline(); // Mark user as offline when the connection is lost
    });

    this.connection.onreconnected((connectionId) => {
      console.log(`SignalR reconnected. Connection ID: ${connectionId}`);
      this.isConnected = true;
      this.userOnline(); // Mark user as online when reconnected
    });

    this.connection.onclose((error) => {
      console.log(`SignalR connection closed. Error: ${error}`);
      this.isConnected = false;
      this.isConnecting = false;
      this.userOffline(); // Mark user as offline when the connection is closed
      setTimeout(() => this.startConnection(), 5000); // Attempt to reconnect after a delay
    });

    this.connection.start()
      .then(() => {
        console.log("SignalR connection established.");
        this.isConnected = true;
        this.isConnecting = false;
        this.userOnline(); // Mark user as online when the connection is established
        this.setupListeners();
      })
      .catch(err => {
        console.error("Error starting SignalR connection:", err.toString());
        this.isConnecting = false;
        setTimeout(() => this.startConnection(), 5000); // Attempt to reconnect after a delay
      });
  }

  setupListeners() {
    this.connection.on("ReceiveMessage", (chat, receivername) => {
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback(chat,receivername);
        }      
    });
    this.connection.on("ReceiveGrpMessage", (user,grpname,groupmsg) => {
      if (this.receiveGroupMessageCallback) {
        console.log("Received grp msg from backend",this.gn,grpname)
        this.receiveGroupMessageCallback(grpname,groupmsg);
      }      
    });

    this.connection.on("MessageRemoved", (messageId, chatDate, senderName) => {
      if (this.removeMessageCallback) {
        this.removeMessageCallback(messageId, chatDate, senderName);
      }
    });
    this.connection.on("GrpMessageRemoved", (groupName,messageId, chatDate) => {
      if (this.removeGrpMessageCallback) {
        this.removeGrpMessageCallback(groupName,messageId, chatDate);
      }
    });    

    this.connection.on("MessageEdited", (messageId, newMessage, chatDate, senderName) => {
      if (this.editMessageCallback) {
        this.editMessageCallback(messageId, newMessage, chatDate, senderName);
      }
    });

    this.connection.on("GrpMessageEdited", (groupName,messageId, newMessage, chatDate) => {
      if (this.editGrpMessageCallback) {
        this.editGrpMessageCallback(groupName,messageId, newMessage, chatDate);
      }
    });

    this.connection.on("UpdateNickname", (userName, newNickName) => {
      console.log("Last second---",this.username,userName,newNickName)
      if (this.editProfileCallback && userName!=this.username) {
        this.editProfileCallback(userName, newNickName);
      }
    });  

    this.connection.on("RecCreateGroup", (user,newGroup,newPic) => {
      if (this.receiveCreateGroupMessageCallback) {
        console.log("Received Create group backend",user,newGroup,newPic)
        this.receiveCreateGroupMessageCallback(newGroup,user,newPic);
      }      
    }); 

    this.connection.on("AddFriend", (groupname,frnd,matter) => {
      if (this.addFriendToGroupMessageCallback) {
        console.log("Adding friend backend",groupname,frnd,matter)
        this.addFriendToGroupMessageCallback(groupname,frnd,matter);
      }      
    });
    
    this.connection.on("AddFriends", (groupname,frnd,matter) => {
      if (this.addFriendToGroupMessageCallback) {
        console.log("Adding friend backend",groupname,frnd,matter)
        this.addFriendToGroupMessageCallback(groupname,frnd,matter);
      }      
    });


    this.connection.on("MessageRead", (messageIds, senderName) => {
      if (this.readMessageCallback) {
        this.readMessageCallback(messageIds, senderName);
      }
    });

    this.connection.on("UserOnline", (username) => {
      if (this.onlineUsersCallback) {
        this.onlineUsersCallback(username);
      }
      if (this.displayOnlineCallback) {
        this.displayOnlineCallback(username);
      }
    });

    this.connection.on("UserOffline", (username,time) => {
      if (this.offlineUsersCallback) {
        this.offlineUsersCallback(username);
      }
      if (this.displayOfflineCallback) {
        this.displayOfflineCallback(username,time);
      }
    });

    this.connection.on("IncrementUnseenMessages", (username, seen = null) => {
      if (this.unseenMessagesCallback) {
        this.unseenMessagesCallback(username, seen);
      }
    });

    this.connection.on("SortChats", (Username, timestamp) => {
      if (this.sortChatsCallback) {
        this.sortChatsCallback(Username, timestamp);
      }
    });

    this.connection.on("UserTyping", (Username,status) => {
      if (this.userTypingCallback) {
        this.userTypingCallback(Username,status);
      }
    });
  }

  ensureConnection() {
    if (!this.isConnected) {
      axios.post(`http://localhost:5290/UserOffline?userName=${this.username}`)
        .then((response) => {
          console.log(response.data);
        })
        .catch(err => console.error(err.toString()));
      this.startConnection();
    }
  }

  userOffline() {
    if (this.connection) {
      const nowUtc = new Date();
        nowUtc.setUTCHours(nowUtc.getUTCHours() + 5);
        nowUtc.setUTCMinutes(nowUtc.getUTCMinutes() + 30);
        const istTimeString = nowUtc.toISOString();
      this.connection.invoke("UserOffline", this.username, istTimeString)
        .catch(err => console.error(err.toString()));
      axios.post(`http://localhost:5290/UserOffline?userName=${this.username}&time=${istTimeString}`)
        .then((response) => {
          console.log(response.data);
        })
        .catch(err => console.error(err.toString()));
      this.connection.stop();
    }
  }

  changeReceiver(receiverId) {
    this.receiverId = receiverId;
  }

  userOnline() {
    this.ensureConnection();
    if (this.connection) {
      axios.post(`http://localhost:5290/UserOnline?userName=${this.username}`)
        .then((response) => {
          console.log(response.data);
        })
        .catch(err => console.error(err.toString()));
    }
    this.makeUserOnline(this.username);
  }

  makeUserOnline(username) {
    this.ensureConnection();
    if (this.isConnected) {
      this.connection.invoke("UserOnline", this.username)
        .catch(err => console.error(err.toString()));
    }
  }

  sendMessage(user, data, receiverId = null,sendername, receivername) {
    this.ensureConnection();
    if (this.connection) {
      if (receiverId) {
        console.log("Sending to the user ::::::::::::::: "+" "+receiverId+" "+receivername)
        this.connection.invoke("SendToUser", this.userId, receiverId, sendername, data)
          .catch(err => console.error(err.toString()));
      } else {
        this.connection.invoke("SendMessage", this.userId, data)
          .catch(err => console.error(err.toString()));
      }
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  sendGrpMessage(user, data, groupname) {
    this.ensureConnection();
    console.log("Sending group message - ",user, groupname,data);
    if (this.connection) {
      this.connection.invoke("SendToGroup",user, groupname, data)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  removeMessage(receiverId, messageId, chatDate, senderName) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("RemoveMessage", receiverId, messageId, chatDate, senderName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  removeGrpMessage(grpName,id,chatDate) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("RemoveGrpMessage",grpName,id,chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  editMessage(receiverId, messageId, newMessage, chatDate, senderName) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("EditMessage", receiverId, messageId, newMessage, chatDate, senderName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  editGroupMessage(groupName, messageId, newMessage, chatDate) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("EditGroupMessage", groupName, messageId, newMessage, chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  editProfile(username,newNickName) {
    this.ensureConnection();
    if (this.connection) {
      console.log("Have in sr---",username,newNickName)
      this.connection.invoke("EditProfile", username,newNickName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  createGrouppp(user,newgroup,newpic){
    this.ensureConnection();
    if (this.connection) {      
      console.log("Groupooooooooooooo",user,newgroup,newpic)
      this.connection.invoke("CreateGroup",user,newgroup,newpic)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  addFriend(groupName,frnd,matter){
    this.ensureConnection();
    if (this.connection) {      
      console.log("Addddd",groupName,frnd,matter)
      this.connection.invoke("AddToGroup",groupName,frnd,matter)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  addme(groupName){
    this.ensureConnection();
    if (this.connection) {      
      console.log("addmee",groupName)
      this.connection.invoke("AddMe",groupName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  readMessage(receiverId, messageIds, senderName) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("MarkAsRead", receiverId, messageIds, senderName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  incrementUnseenMessages(receiverId, username, seen = null) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("IncrementUnseenMessages", receiverId, username, seen)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  sortChats(receiverId, Username, timestamp) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("SortChats", receiverId, Username, timestamp)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  userTyping(receiverId,Username,status){
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("UserTyping", receiverId, Username, status)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  setReceiveMessageCallback(callback) {
    this.receiveMessageCallback = callback;
  }

  setReceiveGroupMessageCallback(callback) {
    this.receiveGroupMessageCallback = callback;
  }
  
  setCreateGroupMessageCallback(callback) {
    this.receiveCreateGroupMessageCallback = callback;
  }

  setaddFriendToGroupMessageCallback(callback) {
    this.addFriendToGroupMessageCallback = callback;
  }

  setAdd(callback){
    this.add=callback;
  }

  setRemoveMessageCallback(callback) {
    this.removeMessageCallback = callback;
  }

  setGrpRemoveMessageCallback(callback) {
    this.removeGrpMessageCallback = callback;
  }

  setEditMessageCallback(callback) {
    this.editMessageCallback = callback;
  }

  setEditGroupMessageCallback(callback) {
    this.editGrpMessageCallback = callback;
  }

  setEditProfileCallback(callback){
    this.editProfileCallback=callback;
  }

  setReadMessageCallback(callback) {
    this.readMessageCallback = callback;
  }

  setOnlineUsersCallback(callback) {
    this.onlineUsersCallback = callback;
  }

  setDisplayOnlineCallback(callback) {
    this.displayOnlineCallback = callback;
  }

  setOfflineUsersCallback(callback) {
    this.offlineUsersCallback = callback;
  }

  setDisplayOfflineCallback(callback) {
    this.displayOfflineCallback = callback;
  }

  setIncrementUnseenMessagesCallback(callback) {
    this.unseenMessagesCallback = callback;
  }

  setSortChatsCallback(callback) {
    this.sortChatsCallback = callback;
  }

  setUserTypingCallback(callback) {
    this.userTypingCallback = callback;
  }

}

export default new SignalRService();
