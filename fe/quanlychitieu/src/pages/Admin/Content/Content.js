import React, { useEffect, useState } from "react";
import { getAllCategories } from "../../../service/CategorieAdmin";
import { getAllUsers } from "../../../service/Auth";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

const DashboardStatistics = () => {
  const [totalCategories, setTotalCategories] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestCategories, setLatestCategories] = useState([]);
  const [error, setError] = useState(null);
  const [currentMonthUsers, setCurrentMonthUsers] = useState([]);
  const [sixMonthUserCount, setSixMonthUserCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [barDataSixMonths, setBarDataSixMonths] = useState({
    labels: [],
    datasets: [],
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = currentMonthUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(currentMonthUsers.length / usersPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndUsers = async () => {
      try {
        const categoriesResponse = await getAllCategories(navigate);
        const income = categoriesResponse.data.filter(
          (category) => category.type === "income"
        ).length;
        const expense = categoriesResponse.data.filter(
          (category) => category.type === "expense"
        ).length;
        setIncomeCount(income);
        setExpenseCount(expense);
        setTotalCategories(categoriesResponse.data.length || 0);

        const categoryCounts = {};
        categoriesResponse.data.forEach((category) => {
          categoryCounts[category.name] =
            (categoryCounts[category.name] || 0) + 1;
        });

        setCategoryData(
          Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count,
          }))
        );

        const sortedCategories = categoriesResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestCategories(sortedCategories.slice(0, 5));

        const usersResponse = await getAllUsers();

        const admins = usersResponse.filter(
          (user) => user.role === "admin"
        ).length;
        const users = usersResponse.filter(
          (user) => user.role === "user"
        ).length;
        setAdminCount(admins);
        setUserCount(users);
        setTotalUsers(usersResponse.length || 0);

        const sortedUsers = usersResponse.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestUsers(sortedUsers.slice(0, 5));

        const currentMonth = new Date().getMonth();
        const currentMonthUsers = usersResponse.filter(
          (user) => new Date(user.createdAt).getMonth() === currentMonth
        );
        setCurrentMonthUsers(currentMonthUsers);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const filteredUsers = usersResponse.filter(
          (user) => new Date(user.createdAt) >= sixMonthsAgo
        );
        setSixMonthUserCount(filteredUsers.length);

        const monthlyCounts = Array(6).fill(0);
        const barColors = [];
        filteredUsers.forEach((user) => {
          const month = new Date(user.createdAt).getMonth();
          const index = (month - (new Date().getMonth() - 5) + 12) % 12;
          monthlyCounts[index]++;
        });

        for (const count of monthlyCounts) {
          barColors.push(
            count < 5 ? "rgba(255, 99, 132, 0.6)" : "rgba(75, 192, 192, 0.6)"
          );
        }

        const labels = [];
        for (let i = 0; i < 6; i++) {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          labels.unshift(month.toLocaleString("default", { month: "short" }));
        }

        setBarDataSixMonths({
          labels,
          datasets: [
            {
              label: "Số Người Dùng Theo Tháng",
              data: monthlyCounts,
              backgroundColor: barColors,
              borderColor: barColors.map((color) => color.replace("0.6", "1")), // Use the same color for the border but fully opaque
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        setError("Failed to fetch data.");
        console.error("Fetch data error:", err);
      }
    };
    fetchCategoriesAndUsers();
  }, [navigate]);

  if (error) return <p>{error}</p>;

  const barData = {
    labels: ["Thu nhập", "Chi tiêu", "Tổng danh mục"],
    datasets: [
      {
        label: "Danh mục",
        data: [incomeCount, expenseCount, totalCategories],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 99, 12, 0.6)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
      },
    ],
  };

  // Tùy chọn cấu hình cho biểu đồ Bar
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dữ liệu cho biểu đồ Pie (Người dùng)
  const barDataUsers = {
    labels: ["Admin", "User"],
    datasets: [
      {
        label: "Tài khoản",
        data: [adminCount, userCount, totalUsers],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 99, 21, 0.6)",
        ],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
      },
    ],
  };

  // Tùy chọn cấu hình cho biểu đồ bar (Người dùng)
  const barOptionsUsers = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-header">
              <h5>Người Dùng Tạo Trong Tháng</h5>
            </div>
            <div className="card-body">
              {currentUsers.length === 0 ? (
                <p>Không có người dùng mới trong tháng này.</p>
              ) : (
                <>
                  <table className="table">
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: "20%" }} scope="col">
                          #
                        </th>
                        <th style={{ width: "40%" }} scope="col">
                          Tên Người Dùng
                        </th>
                        <th style={{ width: "40%" }} scope="col">
                          Ngày Tạo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr key={user._id}>
                          <th scope="row">{indexOfFirstUser + index + 1}</th>
                          <td>{user.name}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav>
                    <ul className="pagination">
                      {pageNumbers.map((number) => (
                        <li key={number} className="page-item">
                          <button onClick={() => paginate(number)} className="page-link">
                            {number}
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

        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-header">
              <h5>Tổng Người Dùng Trong 6 Tháng Qua</h5>
            </div>
            <div className="card-body">
              <Bar
                data={barDataSixMonths}
                options={{ scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-body">
              <h5>Biểu Đồ Danh mục</h5>
              <Bar
                data={barData}
                options={{ scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-body">
              <h5>Biểu Đồ Phân Loại Người Dùng Theo Vai Trò</h5>
              <Bar
                data={barDataUsers}
                options={{ scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-header">
              <h5>5 Danh mục mới nhất</h5>
            </div>
            <div className="card-body">
              <table class="table">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Tên danh mục</th>
                    <th scope="col">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {latestCategories.map((category, index) => (
                    <tr key={category._id}>
                      <th scope="row">{index + 1}</th>
                      <td>{category.name}</td>
                      <td>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/admin/categories")}
              >
                Xem Thêm
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mt-4">
            <div className="card-header">
              <h5>5 người dùng mới tạo gần đây</h5>
            </div>
            <div className="card-body">
              <table class="table">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Tên người dùng </th>
                    <th scope="col">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUsers.map((user, index) => (
                    <tr>
                      <th key={user._id} scope="row">
                        {index + 1}
                      </th>
                      <td> {user.name}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/admin/users")}
              >
                Xem Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatistics;
