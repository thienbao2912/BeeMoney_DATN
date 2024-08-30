import React, { useState } from 'react';
import { Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            navigate(`/admin/categories?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg shadow-sm">
            <div className="container-fluid">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item text-muted">Trang chủ</li>
                    </ol>
                </nav>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <div className="ms-auto d-flex align-items-center">
                        <div className="input-group">
                            <button 
                                className="input-group-text btn btn-light" 
                                onClick={handleSearchClick}
                                style={{ border: 'none', backgroundColor: 'transparent' }}
                            >
                                <Search />
                            </button>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
