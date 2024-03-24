import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

const Registration = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Access the history object
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
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
          history.push('/login');
        } else {
          alert(response.statusText);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    setEmail('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="text-center mb-4">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input type="email" className="form-control" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Register</button>
              </form>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
