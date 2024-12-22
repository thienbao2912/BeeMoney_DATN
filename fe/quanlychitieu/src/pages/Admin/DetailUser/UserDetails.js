import React, { useState, useEffect } from "react";
import Layout from "../../../layouts/AdminLayout";
import { useParams } from "react-router-dom";
import { getUser } from "../../../service/Auth"; 
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserDetail.css";
import { getAllCategories } from '../../../service/Category';
import { getUserHobbies } from "../../../service/Auth";
import { getAllBudgets } from "../../../service/Budget";
import { getUserSavingsGoals } from "../../../service/SavingsFund"; 
import { getAllSavingsGoals } from "../../../service/SavingGoal";
const UserDetail = () => {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]); // Add state to store budgets
  const [goals, setGoals] = useState([]); // Add state to store budgets
  const [funds, setFunds] = useState([]); // Add state to store savings goals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Page number for hobbies
  const [hobbiesPerPage] = useState(6); // Number of hobbies per page

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Fetch user details
        const data = await getUser(id);

        // Fetch all categories related to user
        const categories = data.categories?.length > 0
          ? await Promise.all(
              data.categories.map(async (categoryId) => {
                const category = await getAllCategories();
                return category.data;
              })
            )
          : [];

        // Sort categories by createdAt
        const sortedCategories = categories.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        data.categories = sortedCategories;

        // Fetch user hobbies
        const hobbiesResponse = await getUserHobbies(id);
        data.hobbies = hobbiesResponse.success ? hobbiesResponse.hobbies : [];

        setUser(data);
      } catch (error) {
        setError("Không thể tải thông tin người dùng.");
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user budgets
    const fetchUserBudgets = async () => {
      try {
        const userBudgets = await getAllBudgets(id); // Assuming this function takes userId as parameter
        setBudgets(userBudgets); // Set budgets state
        console.log("Budgets", userBudgets);
        
      } catch (error) {
        console.error("Error fetching user budgets:", error);
        setError("Không thể tải thông tin ngân sách.");
      }
    };
    const fetchUserGoals = async () => {
      try {
        const userGoals = await getAllSavingsGoals(id);
        console.log("Goals", userGoals);

        if (userGoals && Array.isArray(userGoals)) {
          setGoals(userGoals); // Lưu vào state
        } else {
          setGoals([]); // Xử lý khi dữ liệu trả về không hợp lệ
        }
      } catch (error) {
        console.error("Error fetching user Goals:", error);
        setError("Không thể tải thông tin mục tiêu.");
      }
    };
    
    const fetchUserFunds = async () => {
      try {
        const userFunds = await getUserSavingsGoals(id);
        console.log("Funds", userFunds);
        if (userFunds && Array.isArray(userFunds)) {
          setFunds(userFunds); // Lưu vào state
        } else {
          setFunds([]); // Xử lý khi dữ liệu trả về không hợp lệ
        }
      } catch (error) {
        console.error("Error fetching user savings goals:", error);
        setError("Không thể tải thông tin quỹ tiết kiệm.");
      }
    };
    

    fetchUserDetails();
    fetchUserGoals();
    fetchUserBudgets();
    fetchUserFunds();
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

  // Format currency for wallet amount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Calculate hobbies to display based on pagination
  const indexOfLastHobby = currentPage * hobbiesPerPage;
  const indexOfFirstHobby = indexOfLastHobby - hobbiesPerPage;
  const currentHobbies = user.hobbies.slice(indexOfFirstHobby, indexOfLastHobby);

  const totalPages = Math.ceil(user.hobbies.length / hobbiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="container py-4">
  <div className="card">
    <div className="card-header">
      <h5>Chi tiết người dùng {user.name}</h5>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-4 d-flex justify-content-center">
          <img
            src={user.avatar || "/path/to/default-avatar.png"}
            alt="Avatar"
            className="img-fluid rounded-circle"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="col-md-8">
          <h3 className="mb-4 mt-2">{user.name}</h3>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Ví:</strong> {formatCurrency(user.wallet)}
          </p>
          <p>
            <strong>Mục tiêu:</strong> {goals.length}{" "}
            {goals.length === 1 ? "mục tiêu" : "mục tiêu"}
          </p>
          <p>
            <strong>Ngân sách:</strong> {budgets.length}{" "}
            {budgets.length === 1 ? "ngân sách" : "ngân sách"}
          </p>
          {/* <p>
            <strong>Quỹ tiết kiệm:</strong> {funds.length}{" "}
            {funds.length === 1
              ? "quỹ tiết kiệm"
              : "quỹ tiết kiệm"}
          </p> */}
          <p className="mb-4">
            <strong>Sở thích:</strong>
          </p>

          {/* Display hobbies */}
          <div className="row">
            {currentHobbies.length > 0 ? (
              currentHobbies.map((hobby, index) => (
                <div
                  key={index}
                  className="col-md-2 col-12 mb-3 d-flex justify-content-center"
                >
                  <div
                    className="card"
                    style={{
                      width: "80%",
                      minHeight: "60px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div className="card-body text-center">
                      <h6
                        className="card-title"
                        style={{
                          fontSize: "0.9rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hobby.name}
                      </h6>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Không có thông tin sở thích.</p>
            )}
          </div>

          <nav>
            <ul className="pagination justify-content-center">
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className="page-item">
                  <button
                    className="page-link"
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</div>

    </Layout>
  );
};

export default UserDetail;