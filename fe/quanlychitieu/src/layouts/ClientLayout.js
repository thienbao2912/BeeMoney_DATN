// src/layouts/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Client/Header/Header';
import Footer from '../components/Client/Footer/Footer';
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
      <Footer />
    </>
  );
};

export default ClientLayout;
