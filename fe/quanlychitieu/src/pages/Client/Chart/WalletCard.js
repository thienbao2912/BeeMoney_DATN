import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../../../service/SavingsFund';
import { getAllBudgets } from '../../../service/Budget';
import { getAllSavingsGoals } from '../../../service/SavingGoal';
import { getUserSavingsGoals } from '../../../service/SavingsFund';
import { toast } from 'react-toastify';

const WalletCard = () => {
  const [user, setUser] = useState(0);
  const [budget, setBudget] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState([]);
  const [savingsFund, setSavingsFund] = useState([]);
  const [latestBudget, setLatestBudget] = useState(null);
  const [latestSavingsGoal, setLatestSavingsGoal] = useState(null);
  const [latestSavingsFund, setLatestSavingsFund] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser({
          wallet: profile.wallet
        })
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    const fetchBudget = async () => {
      try {
        const budget = await getAllBudgets(userId);
        const sortedBudgets = budget.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBudget(budget)
        setLatestBudget(sortedBudgets[0] || null)
      } catch (error) {
        console.error("Error fetching budget:", error);
      }
    }
    const fetchSavingsGoal = async () => {
      try {
        const savingsGoal = await getAllSavingsGoals(userId);
        const sortedSavingsGoal = savingsGoal.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSavingsGoal(savingsGoal)
        setLatestSavingsGoal(sortedSavingsGoal[0] || null)
      } catch (error) {
        console.error("Error fetching savingsGoal:", error);
      }
    }
    const fetchSavingsFund = async () => {
      try {
        const savingsFund = await getUserSavingsGoals(userId);
        const sortedSavingsFund = savingsFund.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSavingsFund(savingsFund)
        setLatestSavingsFund(sortedSavingsFund[0] || null)
      } catch (error) {
        console.error("Error fetching savingsFund:", error);
      }
    }
    fetchUserProfile();
    fetchBudget();
    fetchSavingsGoal();
    fetchSavingsFund()
  }, [])





  return (
    <div className="row mt-3 mb-2">
      <div className="col-md-3">
        <div className="card shadow-sm p-3">
          <div className="d-flex align-items-center mb-3">
            <i
              className="bi bi-wallet2"
              style={{
                fontSize: "50px",
                color: "#81c784",
                marginRight: "10px",
              }}
            ></i>
            <div className="ms-2">
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: "4px",
                }}
              >
                Số dư
              </p>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >

                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(user.wallet ?? 0)}

              </h2>
            </div>
          </div>


          <hr className="my-2" />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <i
              className="bi bi-eye-fill text-secondary"
              style={{ fontSize: "15px", cursor: "pointer" }}
            ></i>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm p-3">
          <div className="d-flex align-items-center mb-3">
            <i
              className="bi bi-database"
              style={{
                fontSize: "50px",
                color: "#f3c013",
                marginRight: "10px",
              }}
            ></i>
            <div className="ms-4">
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: "4px",
                }}
              >
                Ngân sách
              </p>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {budget?.length || 0}
              </h2>
            </div>
          </div>


          <hr className="my-2" />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <img
                src={latestBudget?.categoryId?.image || "/images/rabbit.png"}
                alt={latestBudget?.categoryId?.name || "Không tồn tại"}
                width="15px"

              />

              <span className="text-secondary" style={{ fontSize: "15px" }}>
                {latestBudget
                  ? ` ${latestBudget.categoryId.name.substring(0, 15)}${latestBudget.categoryId.name.length > 15 ? "..." : ""
                  }`
                  : "Không có"}
              </span>

            </div>
            <Link to="/budget"> <i
              className="bi bi-arrow-90deg-right text-secondary"
              style={{ fontSize: "15px", cursor: "pointer" }}
            ></i>
            </Link>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm p-3">
          <div className="d-flex align-items-center mb-3">
            <i
              className="bi bi-piggy-bank"
              style={{
                fontSize: "50px",
                color: "#ffa726",
                marginRight: "10px",
              }}
            ></i>
            <div className="ms-4">
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: "4px",
                }}
              >
                Mục tiêu
              </p>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {savingsGoal?.length || 0}
              </h2>
            </div>
          </div>


          <hr className="my-2" />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <img
                src={latestSavingsGoal?.categoryId?.image || "/images/rabbit.png"}
                alt={latestSavingsGoal?.categoryId?.name || "Không tồn tại"}
                width="15px"

              />
              <span className="text-secondary" style={{ fontSize: "15px" }}>
                {latestSavingsGoal
                  ? ` ${latestSavingsGoal.name.substring(0, 15)}${latestSavingsGoal.name.length > 15 ? "..." : ""
                  }`
                  : "Không có"}
              </span>

            </div>
            <Link to="/saving-goal/list"> <i
              className="bi bi-arrow-90deg-right text-secondary"
              style={{ fontSize: "15px", cursor: "pointer" }}
            ></i>
            </Link>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm p-3">
          <div className="d-flex align-items-center mb-3">
            <i
              className="bi bi-people-fill"
              style={{
                fontSize: "50px",
                color: "#87ceeb",
                marginRight: "10px",
              }}
            ></i>
            <div className="ms-4">
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6c757d",
                  marginBottom: "4px",
                }}
              >
                Quỹ chung
              </p>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {savingsFund?.length || 0}
              </h2>
            </div>
          </div>


          <hr className="my-2" />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <img
                src={latestSavingsFund?.categoryId?.image || "/images/rabbit.png"}
                alt={latestSavingsFund?.categoryId?.name || "Không tồn tại"}
                width="15px"

              />
              <span className="text-secondary" style={{ fontSize: "15px" }}>
                {latestSavingsFund
                  ? ` ${latestSavingsFund.name.substring(0, 15)}${latestSavingsFund.name.length > 15 ? "..." : ""
                  }`
                  : "Không có"}
              </span>
            </div>
            <Link to="/savings-fund/list"> <i
              className="bi bi-arrow-90deg-right text-secondary"
              style={{ fontSize: "15px", cursor: "pointer" }}
            ></i>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
