// UserTile.js
import React from 'react';

const UserTile = ({ user }) => {
  return (
    <div className="user-tile">
      <p>{user.username}</p>
      {/* You can include more user information here */}
    </div>
  );
};

export default UserTile;
