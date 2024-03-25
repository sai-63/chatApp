const { io } = require("socket.io-client");

const socket = io();
console.log(socket)
export default socket;