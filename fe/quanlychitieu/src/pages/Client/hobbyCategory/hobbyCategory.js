import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAllCategories } from "../../../service/Category";

const HobbyCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetching(true);
      try {
        const data = await getAllCategories();
        console.log("Fetched categories:", data.data);
        const sortedCategories = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories((prevSelected) => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      console.log("Selected categories:", selectedCategories);
    } else {
      alert("Vui lòng chọn ít nhất một danh mục!");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/" className="text-primary" style={{ cursor: "pointer", textDecoration:'none' }}>
          bỏ qua
        </Link>
        <h4 className="text-center flex-grow-1 m-0">
          Chọn những danh mục bạn muốn hướng đến
        </h4>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={selectedCategories.length === 0}
        >
          Tiếp tục
        </button>
      </div>
      {isFetching ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="row">
            {categories.map((category) => (
              <div key={category._id} className="col-md-3 mb-4">
                <div
                  className={`card text-center ${
                    selectedCategories.includes(category._id)
                      ? "border-primary"
                      : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    border: selectedCategories.includes(category._id)
                      ? "2px solid blue"
                      : "1px solid #ddd",
                  }}
                  onClick={() => toggleCategorySelection(category._id)}
                >
                  <div className="card-body">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="img-fluid mb-2"
                        style={{ maxHeight: "80px", objectFit: "cover" }}
                      />
                    )}
                    <h5 className="card-title">{category.name}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HobbyCategory;
