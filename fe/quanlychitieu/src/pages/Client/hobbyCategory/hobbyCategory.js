import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAllCategories } from "../../../service/Category";
import { getUserHobbies, addHobbies, removeHobby } from "../../../service/Auth"; // Thêm service để xóa sở thích

const HobbyCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // Danh sách các sở thích đã chọn
  const [userHobbies, setUserHobbies] = useState([]); // Lưu sở thích của người dùng
  const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
  const navigate = useNavigate(); // Sử dụng hook `useNavigate` để điều hướng

  useEffect(() => {
    const fetchCategoriesAndHobbies = async () => {
      setIsFetching(true);
      try {
        // Lấy danh mục và sở thích của người dùng
        const categoriesData = await getAllCategories();
        const hobbiesData = await getUserHobbies(userId); // Lấy sở thích của người dùng

        // Sắp xếp danh mục theo ngày tạo
        const sortedCategories = categoriesData.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Lưu danh mục vào trạng thái
        setCategories(sortedCategories);

        // Lưu sở thích của người dùng nhưng không tự động chọn
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
    // Kiểm tra xem sở thích đã có trong cơ sở dữ liệu của người dùng chưa
    const isAlreadyAdded = userHobbies.some(hobby => hobby.categoryId === categoryId);
  
    // Kiểm tra nếu sở thích đã được chọn
    if (selectedCategories.includes(categoryId)) {
      // Nếu sở thích đã được chọn, xóa sở thích khỏi cơ sở dữ liệu
      try {
        await removeHobby(userId, categoryId); // Gửi yêu cầu xóa sở thích
        setSelectedCategories((prevSelected) => prevSelected.filter((id) => id !== categoryId)); // Cập nhật danh sách sở thích đã chọn
      } catch (error) {
        alert("Đã có lỗi xảy ra khi xóa sở thích.");
      }
    } else {
      // Nếu sở thích chưa được chọn và chưa có trong cơ sở dữ liệu
      if (!isAlreadyAdded) {
        try {
          // Thêm sở thích vào cơ sở dữ liệu
          await addHobbies(userId, [{ categoryId, name: categories.find(cat => cat._id === categoryId).name }]);
          setSelectedCategories((prevSelected) => [...prevSelected, categoryId]); // Cập nhật danh sách sở thích đã chọn
        } catch (error) {
          alert("Đã có lỗi xảy ra khi thêm sở thích.");
        }
      } else {
        // Nếu sở thích đã có trong cơ sở dữ liệu, không cho phép thêm lại
        alert("Sở thích này đã có trong danh sách của bạn.");
      }
    }
  };

  const handleContinue = async () => {
    if (selectedCategories.length > 0) {
      try {
        // Chuyển đổi các danh mục đã chọn thành sở thích
        const hobbies = selectedCategories.map(categoryId => ({
          categoryId,
          name: categories.find(cat => cat._id === categoryId).name,
        }));
        
        // Gửi yêu cầu thêm sở thích nếu chưa có
        const res = await addHobbies(userId, hobbies);
        if (res.success) {
          alert("Sở thích đã được thêm thành công!");
          navigate('/'); // Điều hướng qua trang home nếu thêm thành công
        } else {
          alert(res.message);
        }
      } catch (error) {
        alert("Đã có lỗi xảy ra khi thêm sở thích.");
      }
    } else {
      alert("Vui lòng chọn ít nhất một danh mục!");
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
    </div>
  );
};

export default HobbyCategory;
