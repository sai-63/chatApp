// import React, { useState } from "react";
// import { OverlayTrigger, Popover } from "react-bootstrap";
// import { AiOutlineSearch, AiOutlineCloseCircle } from "react-icons/ai";
// import { BiArrowBack } from "react-icons/bi";
// import { FiMoreVertical } from "react-icons/fi";
// import socket from "../socket";
// import { useEffect } from "react";

// function Header({ person, showPerson, setSearch }) {
//   const [iconActive, setIconActive] = useState(true);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typing, setTyping] = useState(null);
//   const [host, setHost] = useState("");

//   socket.on("allusers", (allUsers) => {
//     setOnlineUsers(allUsers);
//   });

//   socket.on("typing", (data) => {
//     setTyping(data);
//   });

//   socket.on("not-typing", (data) => {
//     setTyping(null);
//   });

//   useEffect(() => {
//     socket.emit("reload");
//     const host = localStorage.getItem("user");
//     setHost(host);
//   }, []);

//   return (
//     <div
//       className="d-flex p-2 ps-3 bg-dark bg-opacity-25 justify-content-center align-items-center rounded-top"
//       style={{ height: "8%" }}
//     >
//       <div className="d-flex align-items-center">
//         <BiArrowBack
//           onClick={() => showPerson({})}
//           className=""
//           style={{ cursor: "pointer" }}
//         />
//         <div className="ms-4 p-0">
//           <span className="fs-5 p-0 m-0">
//             {person.username?.charAt(0).toUpperCase() +
//               person.username?.slice(1)}
//           </span>
//           {onlineUsers?.find((user) => user.username === person.userid) &&
//           (typing?.receiverId === host &&
//           typing?.senderId === person.userid ? (
//             <span
//               className="p-0 ms-2 m-0 p-0 mt-auto d-inline text-success fw-semibold"
//               style={{ fontSize: "12px" }}
//             >
//               typing...
//             </span>
//           ) : (
//             <span
//               className="p-0 ms-2 m-0 p-0 mt-auto d-inline text-success fw-semibold"
//               style={{ fontSize: "12px" }}
//             >
//               Online
//             </span>
//           ))}
//         </div>
//       </div>
//       <div className="ms-auto">
//         <OverlayTrigger
//           trigger={"click"}
//           key={"top"}
//           placement={"bottom-end"}
//           overlay={
//             <Popover>
//               <input
//                 type="text"
//                 name=""
//                 id=""
//                 className="form-control"
//                 placeholder="Search Chat..."
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                 }}
//               />
//             </Popover>
//           }
//         >
//           <div className="btn p-0 m-0">
//             {iconActive ? (
//               <AiOutlineSearch
//                 onClick={() => setIconActive(!iconActive)}
//                 style={{ cursor: "pointer" }}
//                 className="fs-4 ms-1 text-dark"
//               />
//             ) : (
//               <AiOutlineCloseCircle
//                 onClick={() => {
//                   setIconActive(!iconActive);
//                   setSearch("");
//                 }}
//                 style={{ cursor: "pointer" }}
//                 className="fs-4 ms-1 text-dark"
//               />
//             )}
//           </div>
//         </OverlayTrigger>

//         <FiMoreVertical className="m-2 fs-5" />
//       </div>
//     </div>
//   );
// }

// export default Header;
