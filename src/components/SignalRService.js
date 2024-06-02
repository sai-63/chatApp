import * as signalR from '@microsoft/signalr';
import axios from "axios";

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.receiveGroupMessageCallback=null;
    this.gid=null;
    this.removeMessageCallback = null;
    this.removeGMessageCallback = null;
    this.editMessageCallback = null;
    this.editGMessageCallback=null;
    this.readMessageCallback = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.userId = null;
    this.username = null;
    this.onlineUsersCallback = null;
    this.displayOnlineCallback = null;
    this.offlineUsersCallback = null;
    this.displayOfflineCallback = null;
    this.unseenMessagesCallback = null;
    this.sortChatsCallback = null;

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
    console.log("Out User connected:",this.userId,"Group id",this.gid);

    if (!this.userId) return;

    this.isConnecting = true;

    const connectionUrl = `http://localhost:5290/notificationHub?userId=${this.userId}`;

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
        // if (this.gid) {
        //   console.log("Joining group in signal",this.gid)
        //   this.joinGroup(this.gid);
        // }
        this.setupListeners();
      })
      .catch(err => {
        console.error("Error starting SignalR connection:", err.toString());
        this.isConnecting = false;
        setTimeout(() => this.startConnection(), 5000); // Attempt to reconnect after a delay
      });
  }

  setupListeners() {
    this.connection.on("ReceiveMessage", (chat) => {
      if ((this.userId === chat.senderId && this.receiverId === chat.receiverId) || 
          (this.receiverId === chat.senderId && this.userId === chat.receiverId)) {
        if (this.userId === chat.receiverId) {
          this.readMessage(chat.senderId, [chat.messageId]);
        }
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback(chat);
        }
      }
    });

    this.connection.on("ReceiveGrpMessage", (user,groupmsg) => {
      console.log("-------------------------------",groupmsg)
      // console.log(`${groupmsg.senderId}: ${groupmsg.message}`,this.gid);
      
      console.log(`${groupmsg.senderId}: ${groupmsg.message}`,groupmsg.id,this.currentGroupName);
      //if (this.currentGroupName === groupmsg.id) { 
        if (this.receiveGroupMessageCallback) {
          console.log("Received grp msg from backend")
          this.receiveGroupMessageCallback(groupmsg);
        }
      //}
    });



    this.connection.on("MessageRemoved", (messageId, chatDate) => {
      if (this.removeMessageCallback) {
        this.removeMessageCallback(messageId, chatDate);
      }
    });
    this.connection.on("GrpMessageRemoved", (messageId, chatDate) => {
      console.log("confirm from backend", messageId, chatDate )
      if (this.removeGMessageCallback) {
        this.removeGMessageCallback(messageId, chatDate);
      }
    });

    this.connection.on("MessageEdited", (messageId, newMessage, chatDate) => {
      if (this.editMessageCallback) {
        this.editMessageCallback(messageId, newMessage, chatDate);
      }
    });
    this.connection.on("GMessageEdited", (messageId, newMessage, chatDate) => {
      if (this.editGMessageCallback) {
        this.editGMessageCallback(messageId, newMessage, chatDate);
      }
    });

    this.connection.on("MessageRead", (messageIds) => {
      if (this.readMessageCallback) {
        this.readMessageCallback(messageIds);
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

    this.connection.on("UserOffline", (username) => {
      if (this.offlineUsersCallback) {
        this.offlineUsersCallback(username);
      }
      if (this.displayOfflineCallback) {
        this.displayOfflineCallback(username);
      }
    });

    this.connection.on("IncrementUnseenMessages", (username,seen=null) => {
      if (this.unseenMessagesCallback) {
        this.unseenMessagesCallback(username,seen);
      }
    });

    this.connection.on("SortChats", (Username,timestamp) => {
      if (this.sortChatsCallback) {
        this.sortChatsCallback(Username,timestamp);
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
      this.connection.invoke("UserOffline", this.username)
        .catch(err => console.error(err.toString()));
    }
    axios.post(`http://localhost:5290/UserOffline?userName=${this.username}`)
      .then((response) => {
        console.log(response.data);
      })
      .catch(err => console.error(err.toString()));
    this.connection.stop();
  }

  changeReceiver(receiverId) {
    this.receiverId = receiverId;
  }
  // changeReceiver(GreceiverId) {
  //   this.GreceiverId = GreceiverId;
  // }

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

  sendMessage(user, data, receiverId = null) {
    this.ensureConnection();
    if (this.connection) {
      if (receiverId) {
        this.connection.invoke("SendToUser", this.userId, receiverId, data)
          .catch(err => console.error(err.toString()));
      } else {
        this.connection.invoke("SendMessage", this.userId, data)
          .catch(err => console.error(err.toString()));
      }
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  // joinGroup(groupName) {
  //   this.ensureConnection();
  //   if (this.connection) {
  //     console.log("Joined grouppppppppp - ",groupName)
  //     this.connection.invoke("JoinGroup", groupName)
  //         .catch(err => console.error("Error joining group:", err.toString()));
  //   }
  // }

  //latest
  // joinGroup(groupName) {
  //   this.ensureConnection();
  //   if (this.connection) {
  //     if (this.currentGroupName) {
  //       this.leaveGroup(this.currentGroupName);
  //     }
  //     console.log("Joined group - ", groupName);
  //     this.connection.invoke("JoinGroup", groupName)
  //       .then(() => {
  //         this.currentGroupName = groupName;
  //       })
  //       .catch(err => console.error("Error joining group:", err.toString()));
  //   }
  // }

  changeGroup(groupName) {
    if (this.currentGroupName) {
        this.leaveGroup(this.currentGroupName);
    }
    this.currentGroupName = groupName;
    this.joinGroup(groupName);
  }

  joinGroup(groupid) {
    this.ensureConnection();
    console.log("Joining group - ", groupid);
    if (this.connection) {
      this.connection.invoke("JoinGroup", groupid)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }
  // joinGroup(newGroupName) {
  //   const currentGroupName = localStorage.getItem("currentGroupName");
  //   this.ensureConnection();
  //   if (this.connection) {
  //     if (currentGroupName && currentGroupName !== newGroupName) {
  //       this.switchGroup(currentGroupName, newGroupName);
  //     } else {
  //       this.connection.invoke("JoinGroup", newGroupName)
  //         .catch(err => console.error("Error joining group:", err.toString()));
  //     }
  //     localStorage.setItem("currentGroupName", newGroupName);
  //   }
  // }
  // joinGroup(newGroupName) {
  //   const currentGroupName = localStorage.getItem("currentGroupName");
  //   this.ensureConnection();
  //   if (this.connection) {
  //       // if (currentGroupName && currentGroupName !== newGroupName) {
  //       //     this.leaveGroup(currentGroupName); // Leave current group if different from new group
  //       // }
  //       // console.log("Invoking joingrp ,",currentGroupName,newGroupName)
  //       // this.connection.invoke("JoinGroup", newGroupName)
  //       //     .catch(err => console.error("Error joining group:", err.toString()));
  //       // localStorage.setItem("currentGroupName", newGroupName);
  //       this.connection.invoke("JoinGroup", newGroupName)
  //   }
  // }
  leaveGroup(groupName) {
    this.ensureConnection();
    console.log("Leaving group - ", groupName);
    if (this.connection) {
      this.connection.invoke("LeaveGroup", groupName)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }
  switchGroup(oldGroupName, newGroupName) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("SwitchGroup",oldGroupName,newGroupName)
      // this.leaveGroup(oldGroupName); // Leave the current group
      // this.joinGroup(newGroupName);
    }
  }

  // sendGrpMessage(user, data, receiverId = null) {
  //   this.ensureConnection();
  //   console.log("Sr from footer - ",this.userId,data,receiverId)    
  //   if (this.connection) {
  //     this.connection.invoke("SendToGroup", this.userId, receiverId, data)
  //       .catch(err => console.error(err.toString()));        
  //   }else{
  //     console.error("SignalR connection is not established.");
  //   }
  // }
  
  sendGrpMessage(user, data, groupid) {
    this.ensureConnection();
    console.log("Sending group message - ",user, groupid,data);
    if (this.connection) {
      this.connection.invoke("SendToGroup",user, groupid, data)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  removeMessage(receiverId, messageId, chatDate) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("RemoveMessage", receiverId, messageId, chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }
  removeGrpMessage(groupid, messageId, chatDate) {
    this.ensureConnection();
    if (this.connection) {
      console.log("Gonna call backend with - ",groupid, messageId, chatDate)
      this.connection.invoke("RemoveGrpMessage", groupid, messageId, chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  editMessage(receiverId, messageId, newMessage, chatDate) {
    this.ensureConnection();
    console.log("came here")
    if (this.connection) {
      this.connection.invoke("EditMessage", receiverId, messageId, newMessage, chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }
  editGMessage(groupId, messageId, newMessage, chatDate) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("EditGMessage", groupId, messageId, newMessage, chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  readMessage(receiverId, messageIds) {
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("MarkAsRead", receiverId, messageIds)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  incrementUnseenMessages(receiverId,username,seen=null){
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("IncrementUnseenMessages", receiverId, username, seen)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  sortChats(receiverId,Username,timestamp){
    this.ensureConnection();
    if (this.connection) {
      this.connection.invoke("SortChats", receiverId,Username,timestamp)
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

  setRemoveMessageCallback(callback) {
    this.removeMessageCallback = callback;
  }
  setGrpRemoveMessageCallback(callback) {
    this.removeGMessageCallback = callback;
  }

  setEditMessageCallback(callback) {
    this.editMessageCallback = callback;
  }
  setEditGMessageCallback(callback) {
    this.editGMessageCallback = callback;
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

}

export default new SignalRService();
