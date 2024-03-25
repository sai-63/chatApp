import axios from "axios";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BiHide, BiShow } from "react-icons/bi";
import { NavLink, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  let {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  let [err, setErr] = useState("");
  const navigate = useNavigate();
  let [show, setShow] = useState(false);
  let [repeatShow, setRepeatShow] = useState(false);

  function submitRegister(e) {
    const url = 'http://localhost:5290/Signup';
    const data = {
      Id:'',
      Username:username,
      Password:password,
      Email:email
    };

    axios.post(url, data)
      .then((response) => {
        if (response.status === 200) {
          alert('Successfully Registered');
          // Redirect to login page
          navigate("/login");
        } else {
          //alert(response.statusText);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    setEmail('');
    setUsername('');
    setPassword('');
  }

  return (
    <div
      className="container d-flex flex-wrap justify-content-around h-100 overflow-auto"
      style={{ position: "relative" }}
    >
      
        
      <div className=" rounded d-flex align-items-center justify-content-center me-5 ms-5 ">
        <form
          className="d-flex flex-column"
          style={{ position: "" }}
          onSubmit={handleSubmit(submitRegister)}
        >
          <h1 className="display-6 mb-3 text- text-center">
            {" "}
            Register Here 
          </h1>
          {err.length !== 0 && <p className="lead text-danger">*{err}</p>}
          <input
            type="text"
            className="mt-3 rounded fs-5 ps-2"
            placeholder="Enter your Name"
            value={username} onChange={(e)=>setUsername(e.target.value)} required
            //{...register("username", { required: true })}
          />
          <label className="ms-5 text-dark">
            *This will be used as your Name in the Chats
          </label>
          {errors.username?.type === "required" && (
            <p className="text-danger">*UserName is required</p>
          )}
          {/*<input
            type="text"
            className="mt-3 rounded fs-5 ps-2"
            placeholder="Create a UserID"
            //{...register("userid", { required: true })}
          />
          <label className="ms-5 text-dark">
            *This will be used as your UserID in the Chats
          </label>
          {errors.userid?.type === "required" && (
            <p className="text-danger">*UserID is required</p>
          )}*/}
          <input
            type="email"
            className="mt-3 rounded fs-5 ps-2"
            placeholder="Enter your Email"
            value={email} onChange={(e)=>setEmail(e.target.value)} required
            //{...register("email", { required: true })}
          />
          {errors.email?.type === "required" && (
            <p className="text-danger">*Email is required</p>
          )}
          {/*<input
            type="number"
            className="mt-3 rounded fs-5 ps-2"
            placeholder="Enter Mobile Number"
           // {...register("mobile")}
          />*/}
          <div className="d-flex p-0">
            <input
              type={show ? "text" : "password"}
              className="mt-3 rounded fs-5 ps-2"
              placeholder="Enter Password"
              value={password} onChange={(e)=>setPassword(e.target.value)} required
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
          {errors.password?.type === "required" && (
            <p className="text-danger">*Password is required</p>
          )}
          {/*
          <div className="d-flex p-0">
            <input
              type={repeatShow ? "text" : "password"}
              className="mt-3 rounded fs-5 ps-2"
              placeholder="Repeat Password"
              {...register("repeatPassword", { required: true })}
            />
            <NavLink
              onClick={() => setRepeatShow(!repeatShow)}
              className="mt-3 ms-2 nav-link pt-1"
            >
              {repeatShow ? (
                <BiHide className="fs-4 m-0" />
              ) : (
                <BiShow className="fs-4 m-0" />
              )}
            </NavLink>
          </div>
          {errors.repeatPassword?.type === "required" && (
            <p className="text-danger">*RepeatPassword is required</p>
          )}
          <label className="mt-3 text-dark lead fs-5">
            Upload your profile pic
          </label>
          <input type="file" {...register("picture")} /> */}
          <Button
            className="btn btn-success text-center m-auto mt-3 mb-1"
            type="submit"
            style={{ width: "35%" }}
          >
            {" "}
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
