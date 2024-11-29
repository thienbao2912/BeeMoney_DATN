import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAllCategories } from "../../../service/Category";
import { getUserHobbies, addHobbies, removeHobby } from "../../../service/Auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HobbyCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [userHobbies, setUserHobbies] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndHobbies = async () => {
      setIsFetching(true);
      try {
        const categoriesData = await getAllCategories();
        const hobbiesData = await getUserHobbies(userId);

        const sortedCategories = categoriesData.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setCategories(sortedCategories);
        setUserHobbies(hobbiesData.hobbies);
      } catch (error) {
        console.error("Error fetching categories or hobbies:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategoriesAndHobbies();
  }, [userId]);

  const toggleCategorySelection = async (categoryId) => {
    const isAlreadyAdded = userHobbies.some(hobby => hobby.categoryId === categoryId);
  
    if (isAlreadyAdded) {
      toast.info("Sở thích này đã có trong danh sách của bạn.");
      return;
    }
  
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };
  

  const handleContinue = async () => {
    if (selectedCategories.length > 0) {
      try {
        const hobbies = selectedCategories.map(categoryId => ({
          categoryId,
          name: categories.find(cat => cat._id === categoryId).name,
        }));
  
        const res = await addHobbies(userId, hobbies);
        if (res.success) {
          toast.success("Sở thích đã được thêm thành công!");
          setTimeout(() => {
            navigate('/');
          }, 2000); // Thêm độ trễ nhỏ để người dùng thấy thông báo
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Đã có lỗi xảy ra khi thêm sở thích.");
      }
    } else {
      toast.warning("Vui lòng chọn ít nhất một danh mục!");
    }
  };
  

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/" className="text-primary" style={{ cursor: "pointer", textDecoration: 'none' }}>
          Bỏ qua
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
        <div className="row">
          {categories.map((category) => (
            <div key={category._id} className="col-md-3 mb-4">
              <div
                className={`card text-center ${selectedCategories.includes(category._id) ? "border-primary" : ""}`}
                style={{
                  cursor: "pointer",
                  border: selectedCategories.includes(category._id) ? "2px solid blue" : "1px solid #ddd",
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
      )}
      <ToastContainer />
    </div>
  );
};

export default HobbyCategory;
