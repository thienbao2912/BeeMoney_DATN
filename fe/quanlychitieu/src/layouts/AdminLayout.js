import React from 'react';
import Sidebar from '../components/Admin/Sidebar/Sidebar';
import Navbar from '../components/Admin/Navbar/Navbar';
import Footer from '../components/Admin/Footer/Footer';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="main-content position-relative flex-grow-1">
          <Navbar />
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
