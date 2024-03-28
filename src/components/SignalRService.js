import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.isConnected = false;
  }

  startConnection() {
    if (!this.isConnected) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5290/notificationHub")
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.start()
        .then(() => {
          console.log("SignalR connection established.");
          this.isConnected = true;
        })
        .catch(err => console.error("Error starting SignalR connection:", err.toString()));

      this.connection.on("ReceiveMessage", (user, message) => {
        // Handle received message
        console.log(`${user}: ${message}`);
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback({ user, message });
        }
      });
    }
  }

  sendMessage(user, message, receiverId=null) {
    if (this.connection) {
      if (receiverId) {
        this.connection.invoke("SendToUser", user, receiverId, message)
          .catch(err => console.error(err.toString()));
      } else {
        this.connection.invoke("SendMessage", user, message)
          .catch(err => console.error(err.toString()));
      }
    } else {
      console.error("SignalR connection is not established.");
    }
  }

  setReceiveMessageCallback(callback) {
    if (!this.receiveMessageCallback) {
      this.receiveMessageCallback = callback;
    }
  }
}

export default new SignalRService();
