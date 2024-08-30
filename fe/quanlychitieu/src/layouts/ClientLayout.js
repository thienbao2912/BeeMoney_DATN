// src/layouts/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Client/Header/Header';
import Sidebar from '../components/Client/Sidebar/Sidebar';
import Footer from '../components/Client/Footer/Footer';

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
