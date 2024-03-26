import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
import EditProfile from "./EditProfile";

function AllChats({ show, setShow, message, setMessage, showPerson }) {
  let [host, setHost] = useState("");
  let [showModal, setShowModal] = useState(false);
  let [userids, setUserId] = useState([]);

  useEffect(() => {
    setHost(localStorage.getItem("user"));

    axios
      .get("http://localhost:5290/GetOtherUsers")
      .then((res) => setUserId(res.data.users))
      .catch((err) => console.log(err));
  }, []);

  function handleChange(event) {
    axios
      .get("http://localhost:5290/GetOtherUsers")
      .then((res) =>
        setUserId(
          res.data.users.filter((obj) =>
            obj.userid.toLowerCase().includes(event.target.value.toLowerCase())
          )
        )
      )
      .catch((err) => console.log(err));
  }

  const showChat = (obj) => {
    showPerson(obj);
  };

  function handleShow() {
    setShow(false);
    setMessage("");
  }
  return (
    <div className="chats overflow-auto" style={{ maxHeight: "100%" }}>
      <h1 className="lead fs-3 text-center m-2 mt-4">
        {" "}
        Welcome{" "}
        <i>
          <b>{host}</b>
        </i>
        ..!!
      </h1>
      <div className="ms-2 d-flex align-items-center mt-1">
        <div className="w-100">
          <AiOutlineSearch className="fs-3" />
          <input
            type="search"
            className="w-75 rounded ps-2"
            onChange={handleChange}
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
      <hr className="w-50 ms-1 m-0" />
      <div className="" style={{ position: "relative" }}>
        {userids?.map(
          (obj) =>
            obj.userid !== host && (
              <>
                <NavLink
                  onClick={() => showChat(obj)}
                  className="p-3 pb-0 d-flex w-100 text-start text-dark nav-link"
                >
                  <p className="lead ms-2 text-white fs-4 d-inline"> {obj.username} </p>
                  <p className="lead ms-2 text-white fs-6 d-inline ms-auto mt-5 mb-0">
                    {obj.userid}
                  </p>
                </NavLink>
                <hr className="ms-1 w-75 m-0" />
              </>
            )
        )}
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

      <EditProfile show={showModal} setShow={setShowModal} />
    </div>
  );
}

export default AllChats;
