import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserTile from './UserTile'; // Import the UserTile component

const Home = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setUserId(localStorage.getItem('userId'));

    axios.get('http://localhost:5290/GetOtherUsers', { params: { id: userId } })
      .then(response => {
        console.log(response.data);
        setOtherUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching other users:', error);
      });
  }, [userId]); // Include userId in the dependency array

  return (
    <div>
      <h2>Welcome to My App, {username}</h2>
      <div>
        <h3>Other Users:</h3>
        <div className="user-tiles">
          {otherUsers.map(user => (
            <UserTile key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
