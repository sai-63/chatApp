import axios from 'axios';
import React, { useState } from 'react';
import { Link,useHistory } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { username, password });
    const url = 'http://localhost:5290/Login';
    const data = {
      Id:'',
      Username:username,
      Password:password,
      Email:''
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
            history.push('/chat');
        }else{
            alert('Invalid Credentials');
        }
    })
    .catch((error)=>{
        console.log(error);
    })
    setUsername('');
    setPassword('');
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Login</button>
              </form>
              <div className="text-center mt-3">
                Don't have an account? <Link to="/">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
