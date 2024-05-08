import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.receiveMessageCallback = null;
    this.isConnected = false;
    this.userId = localStorage.getItem("userId");
  }

  startConnection() {
    if (!this.isConnected) {
      // Include userId as a query parameter in the connection URL
      const connectionUrl = `http://localhost:5290/notificationHub?userId=${this.userId}`;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(connectionUrl)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register event handlers for connection lifecycle events
      this.connection.onclose(() => {
        console.log("SignalR connection closed. Reconnecting...");
        this.isConnected = false;
        setTimeout(() => this.startConnection(), 5000); // Attempt to reconnect after 5 seconds
      });

      this.connection.start()
        .then(() => {
          console.log("SignalR connection established.");
          this.isConnected = true;
        })
        .catch(err => {
          console.error("Error starting SignalR connection:", err.toString());
          setTimeout(() => this.startConnection(), 5000); // Attempt to reconnect after 5 seconds
        });

      this.connection.on("ReceiveMessage", (user, message) => {
        // Handle received message
        console.log(`${user}: ${message}`);
        if (this.receiveMessageCallback) {
          this.receiveMessageCallback({ user, message });
        }
      });
    }
  }

  sendMessage(user, message, receiverId = null) {
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
