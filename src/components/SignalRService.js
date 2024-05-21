import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.receiveGroupMessageCallback = null;
    this.removeMessageCallback = null;
    this.isConnected = false;
    this.userId = null;
    this.receiver = null;
    this.gid=null;
  }
  startConnection() {
    //console.log("For testing we have grpperson as",localStorage.getItem(grpperson))
    this.userId = localStorage.getItem("userId");
    this.receiver = localStorage.getItem("receiver");
    this.gid=localStorage.getItem("groupid")
    console.log("Out User connected:",this.userId," Reciever is:",this.receiver,"Group id",this.gid);
    if (!this.isConnected) {
      const connectionUrl = `http://localhost:5290/notificationHub?userId=${this.userId}`;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(connectionUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onclose(() => {
        console.log("SignalR connection closed. Reconnecting...");
        this.isConnected = false;
        setTimeout(() => this.startConnection(), 5000); 
      });

      this.connection.start()
        .then(() => {
          console.log("SignalR connection established.");
          this.isConnected = true;
        })
        .catch(err => {
          console.error("Error starting SignalR connection:", err.toString());
          setTimeout(() => this.startConnection(), 5000); 
        });

      this.connection.on("ReceiveMessage", (user,chat) => {
        console.log("na family safe")
        console.log(`${chat.senderId}: ${chat.message}`,this.receiver,localStorage.getItem("reciever"));
        if(this.receiver === user || this.userId === user){
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback(chat);
        }}
      });

      this.connection.on("ReceiveGrpMessage", (user,groupmsg) => {
        console.log("na family safe")
        console.log("We got user grp from signalr rotation as :",user,groupmsg)
        console.log(`${groupmsg.senderId}: ${groupmsg.message}`,this.gid);
        if (this.receiveGroupMessageCallback) {
          this.receiveGroupMessageCallback(groupmsg);
        }
      });

      this.connection.on("MessageRemoved", (messageId,chatDate) => {
        // Remove message from UI using messageId
        // Example: document.getElementById(messageId).remove();
        if (this.removeMessageCallback) {
          this.removeMessageCallback(messageId,chatDate);
        }
    });
    

    }
  }

  sendMessage(user, data, receiverId = null) {
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

  removeMessage(receiverId,messageId,chatDate) {
    if (this.connection) {
      this.connection.invoke("RemoveMessage",receiverId, messageId,chatDate)
        .catch(err => console.error(err.toString()));
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  setReceiveMessageCallback(callback) {
    if (!this.receiveMessageCallback) {
      this.receiveMessageCallback = callback;
    }
  }
  setReceiveGroupMessageCallback(callback) {
      this.receiveGroupMessageCallback = callback;
  }

  setRemoveMessageCallback(callback){
    if (!this.removeMessageCallback) {
      this.removeMessageCallback = callback;
    }
  }


  //Group Chat SignalR
  // Join a group (add this where appropriate)
  joinGroup(groupName) {
    if (this.connection) {
      this.connection.invoke("JoinGroup", groupName)
          .catch(err => console.error("Error joining group:", err.toString()));
    }
  }

  // Send message to group
  sendMessageToGroup(groupid,userId,dataa) {
    if (this.connection) {
      // console.log("Sending the det from signalr",groupid, userId, dataa)
      this.connection.invoke("SendToGroup", groupid, userId, dataa)
        .catch(err => console.error(err.toString()));
    }
    console.error("SignalR connection is not established.");
  }

  // Remove message from group
  removeMessageFromGroup(groupName, messageId, chatDate) {
    if (this.connection) {
      this.connection.invoke("RemoveMessageFromGroup", groupName, messageId, chatDate)
      .catch(err => console.error(err.toString()));
    }else{
      console.error("SignalR connection is not established.");
    }
  }

}

export default new SignalRService();
