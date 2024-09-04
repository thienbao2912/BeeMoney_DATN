import React, { useState, useEffect } from 'react';
import Layout from '../../../layouts/AdminLayout';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../../service/Auth';
import { RingLoader } from 'react-spinners';
import ConfirmDeleteModal from '../../../components/Admin/ConfirmDeleteModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './User.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const usersPerPage = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                const sortedUsers = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUsers(sortedUsers);
            } catch (error) {
                setError('Failed to fetch users.');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete._id);
                setUsers(users.filter(user => user._id !== userToDelete._id));
                setShowConfirmModal(false);
            } catch (error) {
                console.error('Error deleting user:', error);
                setError('Failed to delete user.');
            }
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowConfirmModal(true);
    };

    const closeDeleteModal = () => {
        setShowConfirmModal(false);
        setUserToDelete(null);
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title">Danh sách tài khoản</h5>
                        <Link to="/admin/users/add" className="btn btn-primary">
                            Thêm người dùng
                        </Link>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                                <RingLoader color="#007bff" />
                            </div>
                        ) : (
                            <>
                                {error && <p>{error}</p>}
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tên</th>
                                            <th>Email</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((user, index) => (
                                            <tr key={user._id}>
                                                <td>{indexOfFirstUser + index + 1}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <div className="dropdown ms-3">
                                                        <button 
                                                            className="btn-drop btn btn-sm dropdown-toggle"
                                                            type="button"
                                                            id={`dropdownMenuButton-${user._id}`}
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                          <svg width="20px" height="20px" viewBox="0 0 24 24"
                                                                    version="1.1">
                                                                    <g stroke="none" stroke-width="1" fill="none"
                                                                        fill-rule="evenodd">
                                                                        <rect x="0" y="0" width="24" height="24" />
                                                                        <circle fill="#000000" cx="5" cy="12"
                                                                            r="2" />
                                                                        <circle fill="#000000" cx="12" cy="12"
                                                                            r="2" />
                                                                        <circle fill="#000000" cx="19" cy="12"
                                                                            r="2" />
                                                                    </g>
                                                                </svg>
                                                        </button>
                                                        <ul
                                                            className="dropdown-menu"
                                                            aria-labelledby={`dropdownMenuButton-${user._id}`}
                                                        >
                                                            <li>
                                                                <Link
                                                                    to={`/admin/users/edit/${user._id}`}
                                                                    className="dropdown-item"
                                                                >
                                                                    Sửa
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    onClick={() => openDeleteModal(user)}
                                                                    className="dropdown-item text-danger"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <nav>
                                    <ul className="pagination justify-content-center">
                                        {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, index) => (
                                            <li key={index} className="page-item">
                                                <button
                                                    onClick={() => paginate(index + 1)}
                                                    className={`page-link ${currentPage === index + 1 ? 'active' : ''}`}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmDeleteModal
                show={showConfirmModal}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteUser}
                name={userToDelete?.name}
            />
        </Layout>
    );
};

export default User;
