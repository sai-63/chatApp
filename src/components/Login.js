import axios from "axios";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BiHide, BiShow } from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";
import SignalRService from "./SignalRService";

function Login() {
  let { register, handleSubmit } = useForm();
  let [err, setErr] = useState("");
  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [username,setUsername]=useState("")
  let [password,setPassword]=useState("")

  function submitLogin(e) {
    console.log('Form submitted:', { username, password });
    const url = 'http://localhost:5290/Login';
    const data = {
      Id:'',
      Username:username,
      Password:password,
      Email:'',
      Nickname:'',
      IsOnline:false,
      Friends:[]
    };
    axios.post(url,data)
    .then((response)=>{
        const dt=response.data;
        console.log(response);
        console.log(dt);
        if(dt.username===username && dt.password===password){
            alert("Login Successful");
            localStorage.setItem("username",username);
            localStorage.setItem("userId",dt.id);
            SignalRService.startConnection();
            navigate("/chat");
        }else{
            alert('Invalid Credentials');
        }
    })
    .catch((error)=>{
        console.log(error);
    })
    setUsername('');
    setPassword('');
  }
 

  return (
    <div
      className="bg-gray-200 flex justify-center items-center h-screen w-screen container d-flex flex-wrap justify-content-evenly overflow-auto h-100"
      style={{ position: "relative" }}
    >
     
      <div className="d-flex flex-column justify-content-center align-items-center mt-auto mb-auto ">
        <form
          onSubmit={handleSubmit(submitLogin)}
          className="text-center d-flex flex-column justify-content-center align-items-center"
        >
          <h1 className="display-5 mt-4">
            {" "}
            Login
          </h1>
          {err.length !== 0 && <p className="lead text-danger">*{err}</p>}
          <div className="d-flex flex-column">
            <input
              value={username} onChange={(e)=>setUsername(e.target.value)} required
              type="text"
              placeholder="Enter UserId"
              className="rounded mt-3 fs-5 ps-2"
              //{...register("userid", { required: true })}
            />
            <div className="d-flex p-0">
              <input
                value={password} onChange={(e)=>setPassword(e.target.value)} required
                type={show ? "text" : "password"}
                placeholder="Enter Password"
                className="rounded mt-3 fs-5 ps-2"
                //{...register("password", { required: true })}
              />
              <NavLink
                onClick={() => setShow(!show)}
                className="mt-3 ms-2 nav-link pt-1"
              >
                {show ? (
                  <BiHide className="fs-4 m-0" />
                ) : (
                  <BiShow className="fs-4 m-0" />
                )}
              </NavLink>
            </div>
          </div>
          <Button type="submit" className="mt-3 btn btn-success">
            {" "}
            Login{" "}
          </Button>
          <NavLink className="text-danger mt-3 ms-auto" to="/forgotPass">
            {" "}
            Forgot Password{" "}
          </NavLink>
        </form>
      </div>
    </div>
  );
}

export default Login;
