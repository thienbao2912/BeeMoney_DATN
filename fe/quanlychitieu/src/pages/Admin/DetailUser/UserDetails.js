import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../../../service/Auth"; 
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDetail.css";

const UserDetail = () => {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUser(id); 
        setUser(data);
      } catch (error) {
        setError("Không thể tải thông tin người dùng.");
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <RingLoader color="#007bff" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h5>Chi tiết người dùng</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <img
                src={user.avatar || "/path/to/default-avatar.png"} 
                alt="Avatar"
                className="img-fluid rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8">
              <h3>{user.name}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Ví:</strong> {user.wallet}</p>
              <p><strong>Chi tiêu:</strong> {user.expenses}</p>
              <p><strong>Thu nhập:</strong> {user.income}</p>
              <p><strong>Vai trò:</strong> {user.role}</p>
              <p><strong>Danh mục:</strong> {user.categories}</p>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-12">
              <h5>Hoạt động gần đây:</h5>
              <ul>
                {user.activities?.length > 0 ? (
                  user.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))
                ) : (
                  <li>Không có hoạt động gần đây.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
