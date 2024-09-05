// src/layouts/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Client/Header/Header';
import Sidebar from '../components/Client/Sidebar/Sidebar';

const ClientLayout = () => {
  return (
    <>
      <Header />
      <Sidebar />
      <div className="main-wrapper my-2">
        <div className="container">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ClientLayout;
