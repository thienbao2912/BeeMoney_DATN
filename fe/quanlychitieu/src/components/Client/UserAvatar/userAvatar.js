import React from 'react';
// import './UserAvatar.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

const UserAvatar = ({ user }) => {
  return (
    <div className="user-avatar d-flex align-items-center">
      <img src={user.avatar} alt="Avatar" width="40" className="" />
      <div>
        <div className=" p-2">Xin chào, {user.name}</div>
      </div>
    </div>
  );
};

export default UserAvatar;
