import React, { useState, useEffect } from 'react';
import { Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../service/Auth';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: 'Nguyen Van A',
        role: 'user',
        avatar: '/images/default-avatar.jpg'
      });
      useEffect(() => {
        const fetchUserProfile = async () => {
          try {
            const profile = await getUserProfile();
            setUser({
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar || '/images/default-avatar.jpg'
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        };
    
        fetchUserProfile();
      }, []);
    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            navigate(`/admin/categories?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg shadow-sm p-3">
            <div className="container-fluid">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item text-muted">Trang chủ</li>
                    </ol>
                </nav>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <div className="ms-auto d-flex align-items-center">
                    <div className=" d-flex align-items-center justify-content-between">
                        <div>
                            <div className="text-muted me-3">Xin chào, {user.name}</div>
                        </div>
                        <img src={user.avatar} alt="Avatar" width="40" height="35" className="rounded-circle" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
