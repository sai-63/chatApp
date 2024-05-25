import React from 'react';
import { AiFillFilePdf, AiFillFileImage, AiFillFileExcel, AiFillFileZip, AiFillFileText, AiFillFilePpt, AiFillFileWord, AiFillFileUnknown } from 'react-icons/ai';
import { GrSpa } from 'react-icons/gr';
import { RiArrowDropDownLine } from 'react-icons/ri';


const Grpmsg=({messagesByDate, host, getCurrentTime, handleGOpen ,handleDeleteModal})=>{
    return (
        <div className="mt-auto">
        {Object.keys(messagesByDate).map((date) => (
          <div key={date}>
            <div className="text-center my-3">
<div className="d-inline-block fs-6 lead m-0 bg-success p-1 rounded text-white">
{date}
</div>
</div>
            {messagesByDate[date].map((obj, index) =>
              obj.senderId === host ? (
                <div
                  key={index}
                  className="ms-auto pe-3 mb-1 d-flex"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="d-inline-block ms-auto fs-6 lead m-0 bg-success pt-1 pb-1 rounded text-white"
                    style={{ position: "relative" }}
                  >
                    {obj.message ? (
                      <div
                        className="d-flex flex-wrap ms-2 me-2 mt-1"
                        id={index}
                        style={{ position: "relative" }}
                      >
                        <p className="m-0 me-2" style={{ position: "relative" }}>
                          {obj.message}
                        </p>
                        <p className="m-0 mt-auto ms-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                          {getCurrentTime(obj.timestamp)}
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
                                <AiFillFilePdf style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("image") ? (
                                <AiFillFileImage style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/vnd") ? (
                                <AiFillFileExcel style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("zip") ? (
                                <AiFillFileZip style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("text/plain") ? (
                                <AiFillFileText style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/powerpoint") ? (
                                <AiFillFilePpt style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/msword") ? (
                                <AiFillFileWord style={{ width: "50px", height: "50px" }} />
                              ) : (
                                <AiFillFileUnknown style={{ width: "50px", height: "50px" }} />
                              )}
                            </div>
                          ) : null}
                          <div className="ms-1">{obj.fileName}</div>
                        </div>
                        <div
                          className="mt-auto ms-auto"
                          style={{ width: "40px", fontSize: "10px" }}
                        >
                          {getCurrentTime(obj.timestamp)}
                        </div>
                      </div>
                    )}
                    <div className="dropstart" style={{ position: "absolute", top: "0", right: "0" }}>
                      <RiArrowDropDownLine
                        className="dropdown-toggle fs-4"
                        style={{ cursor: "pointer" }}
                        data-bs-toggle="dropdown"
                      />                      
                      <ul className="dropdown-menu p-0 text-center">
                        <li className="text-center btn d-block" onClick={() => handleDeleteModal(obj, index)}>
                            <p className="dropdown-item m-0">DeleteGmsg</p>
                        </li>
                        <li className="text-center btn d-block" onClick={() => handleGOpen(obj)}>
                            <p className="dropdown-item m-0">EditGmsg</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className="ps-2 mb-1"
                  style={{ width: "60%", wordBreak: "break-word" }}
                >
                  <div
                    className="lead m-0 fs-6 d-inline-block text-white bg-secondary p-3 pt-1 pb-1 rounded"
                    style={{ position: "relative" }}
                  >
                    {obj.message ? (
                      <div className="d-flex flex-wrap ms-2 me-2 d-inline" style={{ position: "relative" }}>
                        <p className="m-0 me-2" style={{ position: "relative" }}>
                          {obj.message}
                        </p>
                        <p className="m-0 mt-auto p-0 d-inline" style={{ fontSize: "10px" }}>
                          {getCurrentTime(obj.timestamp)}
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex ms-1 me-1" style={{ position: "relative" }}>
                        <div className="d-flex flex-wrap justify-content-between" style={{ position: "relative" }}>
                          {obj.fileType ? (
                            <div style={{ position: "relative" }}>
                              {obj.fileType === "application/pdf" ? (
                                <AiFillFilePdf style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("image") ? (
                                <AiFillFileImage style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/vnd") ? (
                                <AiFillFileExcel style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("zip") ? (
                                <AiFillFileZip style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("text/plain") ? (
                                <AiFillFileText style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/powerpoint") ? (
                                <AiFillFilePpt style={{ width: "50px", height: "50px" }} />
                              ) : obj.fileType.includes("application/msword") ? (
                                <AiFillFileWord style={{ width: "50px", height: "50px" }} />
                              ) : (
                                <AiFillFileUnknown style={{ width: "50px", height: "50px" }} />
                              )}
                            </div>
                          ) : null}
                          <p className="ms-1">{obj.fileName}</p>
                        </div>
                        <div className="mt-auto d-inline" style={{ fontSize: "10px", width: "50px" }}>
                          {getCurrentTime(obj.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    )
}
export default Grpmsg;