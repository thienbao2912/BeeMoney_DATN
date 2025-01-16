import React, { useState, useEffect } from "react";

const BudgetWarning = ({ budgets }) => {
  const [warningMessage, setWarningMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [categoryRemaining, setCategoryRemaining] = useState({});

  useEffect(() => {
    if (!budgets || budgets.length === 0) {
      setWarningMessage("Chưa có dữ liệu ngân sách.");
      setShowPopup(false);
      return;
    }

    // Lọc bỏ các ngân sách có danh mục đã bị xóa (categoryId là null hoặc undefined)
    const validBudgets = budgets.filter((budget) => budget.categoryId && budget.categoryId.name);

    if (validBudgets.length === 0) {
      setWarningMessage("Không có ngân sách hợp lệ.");
      setShowPopup(false);
      return;
    }

    // Tính tổng ngân sách theo từng danh mục
    const categoryTotal = validBudgets.reduce((acc, budget) => {
      const categoryName = budget.categoryId.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += budget.amount || 0;
      return acc;
    }, {});
    setCategoryBudgets(categoryTotal); // Lưu tổng ngân sách theo danh mục

    // Tính tổng remainingBudget theo từng danh mục
    const categoryRemainingTotal = validBudgets.reduce((acc, budget) => {
      const categoryName = budget.categoryId.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += budget.remainingBudget || 0;
      return acc;
    }, {});
    setCategoryRemaining(categoryRemainingTotal); // Lưu tổng remainingBudget theo danh mục

    // Kiểm tra các ngân sách có remainingBudget dưới 20% hoặc dưới 0
    const lowBudget = Object.keys(categoryRemainingTotal).filter((categoryName) => {
      const remaining = categoryRemainingTotal[categoryName];
      const total = categoryTotal[categoryName];
      return (remaining / total) * 100 < 20 || remaining <= 0;
    });

    // Nếu có danh mục nào có ngân sách dưới 20% hoặc dưới 0, hiển thị cảnh báo
    if (lowBudget.length > 0) {
      const lowCategoryRemaining = lowBudget.reduce((acc, categoryName) => {
        const remaining = categoryRemainingTotal[categoryName];
        const total = categoryTotal[categoryName];

        acc[categoryName] = {
          remaining,
          total,
        };
        return acc;
      }, {});

      setCategoryRemaining(lowCategoryRemaining);

      // Xử lý thông báo cho từng danh mục
      const messages = lowBudget.map((categoryName) => {
        const remaining = lowCategoryRemaining[categoryName].remaining;
        const total = lowCategoryRemaining[categoryName].total;

        if (remaining <= 0) {
          return `Ngân sách "${categoryName}" đã hết, vượt quá giới hạn bạn nên điều chỉnh lại ngân sách của mình.`;
        } else {
          return `Ngân sách "${categoryName}" gần hết: chỉ còn ${remaining.toLocaleString()} VNĐ/${total.toLocaleString()} VNĐ`;
        }
      });

      setWarningMessage(messages.join(" | "));
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [budgets]);

  const handleGoToAddBudget = () => {
    // Chuyển hướng tới trang AddBudget
    window.location.href = "/budget"; // Thay đổi URL phù hợp với dự án của bạn
  };

  return (
    <>
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "300px",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Nút đóng hình dấu X */}
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => setShowPopup(false)}
            >
              ✖
            </button>

            <h2 style={{ marginBottom: "10px" }}>Cảnh báo!</h2>

            {/* Hiển thị cảnh báo tổng hợp */}
            <p>{warningMessage}</p>

            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                top: "10px",
              }}
              onClick={handleGoToAddBudget}
            >
              Điều chỉnh ngân sách
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetWarning;
