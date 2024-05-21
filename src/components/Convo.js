import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import {
  AiFillFileExcel,
  AiFillFileImage,
  AiFillFilePdf,
  AiFillFilePpt,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileWord,
  AiFillFileZip,
} from "react-icons/ai";
import { BsChevronDoubleDown } from "react-icons/bs";
import { IoMdDownload } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import socket from "./socket";
import SignalRService from './SignalRService';

function Convo({ person, setShow, setMessage, search ,prevMessages ,setPrevMessages }) {
  let [host, setHost] = useState("");
  let [isLoaded, setIsLoaded] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteObject, setDeleteObject] = useState({});
  const [state, setState] = useState(true);
  const [scroll, setScroll] = useState(false);

  function handleClose() {
    setShowModal(false);
    setDeleteObject({});
  }

  const scrollRef = useRef(null);

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }
  const handleDownload = async (obj) => {
    try {
      // Set downloading state to true to indicate that download is in progress
      //setDownloading(true);

      // Make a request to the backend to download the file content
      // const response = await axios.get('http://localhost:5290/Chat/DownloadFile', {
      //   params: obj, // Pass the entire message object as query parameters
      //   responseType: 'blob' // Set response type to blob to handle file download
      // });
      const response = await axios.post('http://localhost:5290/Chat/DownloadFile', obj, {
        responseType: 'blob' // Set response type to blob to handle file download
      });
  
      // Determine content type from response headers
      const contentType = response.headers['content-type'];
  
      // Create a URL for the blob and create a link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', obj.fileName); // Set file name
  
      // If content type is known, set it for the downloaded file
      if (contentType) {
        link.setAttribute('type', contentType);
      }
  
      document.body.appendChild(link);
      link.click();

      // Reset downloading state after successful download
     // setDownloading(false);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Handle error
      // Reset downloading state
      //setDownloading(false);
    }
  };

  useEffect(() => {

    setHost(localStorage.getItem("userId"));

    let hosting = localStorage.getItem("user");

    axios
      .get("http://localhost:5290/Chat/GetMessagesSenderIdUserId",{params:{senderId:host,receiverId:person.id}})
      .then((response) => {
        console.log(response) 
        console.log(response.data);
        setPrevMessages(response.data);
        setShow(false);
        //setMessage("");
        setIsLoaded(false);
        setScroll(!scroll);
        setMessage("");
      })
      .catch((err) => console.log(err.message));
      
  }, [person, search]);
  
  
  useEffect(()=>{
    setState(!state);
    // console.log("Prev messages changed in convo:",prevMessages);
  },[prevMessages])



  useEffect(() => {
    setIsLoaded(true);
  }, [person]);

  useEffect(() => {
    scrollDown();
  }, [scroll]);

  

  if (isLoaded) {
    return (
      <div className="bg-white d-flex" style={{ height: "82%" }}>
        <Spinner className="m-auto" animation="border" variant="primary" />
      </div>
    );
  }




  return (
    <div style={{ height: "82%", position: "relative" }}>
      <div
        ref={scrollRef}
        className="d-flex flex-column overflow-auto pb-2 bg-light h-100"
      >
        {prevMessages.length !== 0 ? (
          <div className="mt-auto">
            {prevMessages.map((obj) =>
              obj.senderId === host ? (
                <div
                  className="ms-auto pe-3 mb-1 d-flex"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="d-inline-block ms-auto fs-6 lead m-0 bg-success pt-1 pb-1 rounded text-white"
                    style={{ position: "relative" }}
                  >
                    {obj.fileName===null ? (
                      <div
                        className="d-flex flex-wrap ms-2 me-2 mt-1"
                        style={{ position: "relative" }}
                      >
                        <p
                          className="m-0 me-2"
                          style={{ position: "relative" }}
                        >
                          {obj.message}
                        </p>
                        <p
                          className="m-0 mt-auto ms-auto p-0 d-inline"
                          style={{ fontSize: "10px" }}
                        >
                          {obj.time}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="d-flex me-1 ms-1 mt-1"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="d-flex flex-wrap justify-content-between"
                          style={{ position: "relative" }}
                        >
                          {obj.fileType ? (
                          <div style={{ position: "relative" }}>
                            {obj.fileType === "application/pdf" ? (
                              <AiFillFilePdf
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("image") ? (
                              <AiFillFileImage
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/vnd") ? (
                              <AiFillFileExcel
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("zip") ? (
                              <AiFillFileZip
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("text/plain") ? (
                              <AiFillFileText
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes(
                                "application/powerpoint"
                              ) ? (
                              <AiFillFilePpt
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/msword") ? (
                              <AiFillFileWord
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : (
                              <AiFillFileUnknown
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            )}
                            <IoMdDownload
                              onClick={() => handleDownload(obj)}
                              className="fs-3 text-dark"
                              style={{
                                position: "absolute",
                                bottom: "1rem",
                                left: "0",
                                borderRadius: "50%",
                                cursor: "pointer",
                              }}
                            />
                          </div>): null }
                          <div className="ms-1">{obj.fileName}</div>
                        </div>
                        <div
                          className=" mt-auto ms-auto"
                          style={{
                            width: "40px",
                            position: "relative",
                            fontSize: "10px",
                          }}
                        >
                          {obj.time}
                        </div>
                      </div>
                    )}
                   
                  </div>
                </div>
              ) : (
                <div
                  className="ps-2 mb-1"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="lead m-0 fs-6 d-inline-block text-white bg-secondary p-3 pt-1 pb-1 rounded"
                    style={{ position: "relative" }}
                  >
                    {obj.message ? (
                      <div
                        className="d-flex flex-wrap ms-2 me-2 d-inline"
                        style={{ position: "relative" }}
                      >
                        <p
                          className="m-0 me-2"
                          style={{ position: "relative" }}
                        >
                          {obj.message}
                        </p>
                        <p
                          className="m-0 mt-auto p-0 d-inline"
                          style={{ fontSize: "10px" }}
                        >
                          {obj.time}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="d-flex ms-1 me-1"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="d-flex flex-wrap justify-content-between"
                          style={{ position: "relative" }}
                        >
                          {obj.fileType ? (
                          <div style={{ position: "relative" }}>
                            {obj.fileType === "application/pdf" ? (
                              <AiFillFilePdf
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("image") ? (
                              <AiFillFileImage
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/vnd") ? (
                              <AiFillFileExcel
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("zip") ? (
                              <AiFillFileZip
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("text/plain") ? (
                              <AiFillFileText
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes(
                                "application/powerpoint"
                              ) ? (
                              <AiFillFilePpt
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : obj.fileType.includes("application/msword") ? (
                              <AiFillFileWord
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            ) : (
                              <AiFillFileUnknown
                                style={{
                                  position: "relative",
                                  width: "50px",
                                  height: "50px",
                                }}
                              />
                            )}
                          
                          </div>
                          ): null}
                          <p className="ms-1">{obj.fileName}</p>
                        </div>
                        <div
                          className="mt-auto d-inline"
                          style={{
                            position: "relative",
                            fontSize: "10px",
                            width: "50px",
                          }}
                        >
                          {" "}
                          {obj.time}{" "}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="lead text-secondary m-auto"> Chat is Empty </p>
        )}
      </div>

      <BsChevronDoubleDown
        className="bg-secondary text-white p-1 btn fs-5"
        onClick={() => setScroll(!scroll)}
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "1rem",
          cursor: "pointer",
          borderRadius: "50%",
        }}
      />

    </div>
  );
}

export default Convo;
