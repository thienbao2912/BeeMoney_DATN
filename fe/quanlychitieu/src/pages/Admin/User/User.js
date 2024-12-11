import React, { useState, useEffect } from "react";
import Layout from "../../../layouts/AdminLayout";
import { Link } from "react-router-dom";
import { getAllUsers, updateUserStatus } from "../../../service/Auth";
import { RingLoader } from "react-spinners";
import LockedModal from "../../../components/Admin/LockedModal";
import { Alert } from "react-bootstrap";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const sortedUsers = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sortedUsers);
      } catch (error) {
        setError("Failed to fetch users.");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // const handleDeleteUser = async () => {
  //   if (userToDelete) {
  //     try {
  //       await deleteUser(userToDelete._id);
  //       setUsers(users.filter((user) => user._id !== userToDelete._id));
  //       setShowConfirmModal(false);
  //     } catch (error) {
  //       console.error("Error deleting user:", error);
  //       setError("Failed to delete user.");
  //     }
  //   }
  // };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        
      await updateUserStatus(userToDelete._id, { status: "locked" });
      
      const data = await getAllUsers();
      const sortedUsers = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsers(sortedUsers);
      toast.success("Khóa tài khoản thành công!", { position: "top-right" });
      setShowConfirmModal(false);
      } catch (error) {
        console.error("Lỗi khi khóa người dùng:", error);
        setError("Không thể khóa người dùng.");
      }
    }
  };

  const unblockUser = async (user) => {
    try {

      await updateUserStatus(user._id, { status: "active" });

      const data = await getAllUsers();
      const sortedUsers = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsers(sortedUsers);
      toast.success("Mở khóa tài khoản thành công!", { position: "top-right" });
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Lỗi khi mở khóa người dùng:", error);
      setError("Không thể mở khóa người dùng.");
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

  const openUnlockModal = (user) => {
    unblockUser(user);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const filteredUsers = users
    .filter((user) => {
      if (roleFilter === "all") {
        return true;
      } else if (roleFilter === "status") {
        return user.status === "locked";
      }
      return user.role === roleFilter;
    })
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <div className="row mb-4 mt-2">
              <div className="col-md-6 mb-3">
                <label htmlFor="search" className="form-label">Tìm kiếm người dùng</label>
                <input
                  type="text"
                  id="search"
                  className="form-control mt-2"
                  placeholder="Tìm kiếm theo tên người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="filter" className="form-label">Lọc người dùng</label>
                <select
                  id="filter"
                  className="form-select mt-2"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="admin">Admin</option>
                  <option value="user">Người dùng</option>
                  <option value="status">Người dùng bị khóa</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <RingLoader color="#007bff" />
              </div>
            ) : (
              <>
                {error && <p>{error}</p>}
                <div className="card">
                  <div className="card-body">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>#</th>
                          <th style={{ width: "30%" }}>Tên</th>
                          <th style={{ width: "30%" }}>Email</th>
                          <th style={{ width: "15%" }}>Phân quyền</th>
                          <th style={{ width: "20%" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user, index) => (
                          <tr key={user._id}>
                            <td>{indexOfFirstUser + index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                              <div className="dropdown ms-3">
                                <button
                                  className="btn-drop btn btn-sm dropdown-toggle"
                                  type="button"
                                  id={`dropdownMenuButton-${user._id}`}
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <svg
                                    width="20px"
                                    height="20px"
                                    viewBox="0 0 24 24"
                                    version="1.1"
                                  >
                                    <g
                                      stroke="none"
                                      stroke-width="1"
                                      fill="none"
                                      fill-rule="evenodd"
                                    >
                                      <rect
                                        x="0"
                                        y="0"
                                        width="24"
                                        height="24"
                                      />
                                      <circle
                                        fill="#000000"
                                        cx="5"
                                        cy="12"
                                        r="2"
                                      />
                                      <circle
                                        fill="#000000"
                                        cx="12"
                                        cy="12"
                                        r="2"
                                      />
                                      <circle
                                        fill="#000000"
                                        cx="19"
                                        cy="12"
                                        r="2"
                                      />
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
                                      {user.status === "locked" ? (
                                        <button
                                          onClick={() => openUnlockModal(user)}
                                          className="dropdown-item text-success"
                                        >
                                          Mở khóa
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => openDeleteModal(user)} 
                                          className="dropdown-item text-danger"
                                        >
                                          Khóa
                                        </button>
                                      )}
                                    </li>
                                    <li>
                                      <Link
                                        to={`/admin/users/details/${user._id}`}
                                        className="dropdown-item"
                                      >
                                        Xem Chi Tiết
                                      </Link>
                                    </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <nav>
                  <ul className="pagination justify-content-center">
                    {Array.from({
                      length: Math.ceil(filteredUsers.length / usersPerPage),
                    }).map((_, index) => (
                      <li key={index} className="page-item">
                        <button
                          onClick={() => paginate(index + 1)}
                          className={`page-link ${currentPage === index + 1 ? "active" : ""
                            }`}
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
      <LockedModal
        show={showConfirmModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        name={userToDelete?.name}
      />
    </Layout>
  );
};

export default User;
