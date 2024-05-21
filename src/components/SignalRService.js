import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.removeMessageCallback = null;
    this.isConnected = false;
    this.userId = null;
    this.receiver = null;
  }

  startConnection() {
    this.userId = localStorage.getItem("userId");
    this.receiver = localStorage.getItem("reciever");
    console.log("Out User connected:",this.userId," Reciever is:",this.receiver);
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
        console.log(`${chat.senderId}: ${chat.message}`,this.receiver);
        if(this.receiver === user || this.userId === user){
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback(chat);
        }}
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

  setRemoveMessageCallback(callback){
    if (!this.removeMessageCallback) {
      this.removeMessageCallback = callback;
    }
  }
}

export default new SignalRService();
