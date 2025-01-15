import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategories, getSavingsFundById, editSavingsFund } from '../../../../service/SavingsFund';

const EditSavingsFund = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('userId'));
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    memberCount: '',
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategoriesAndSavingFund = async () => {
      try {
        if (!userId) {
          console.error('User ID is not found in local storage');
          setLoading(false);
          return;
        }
        setLoading(true);
        const categoriesResponse = await getCategories("expense", userId);
        setCategories(
          categoriesResponse.filter((category) => category.type === "expense")
        );

        const savingFundResponse = await getSavingsFundById(id);

        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };
        setFormData({
          name: savingFundResponse.name,
          targetAmount: formatCurrency(savingFundResponse.targetAmount),
          currentAmount: formatCurrency(savingFundResponse.currentAmount || 0),
          startDate: formatDate(savingFundResponse.startDate),
          endDate: formatDate(savingFundResponse.endDate),
          memberCount: savingFundResponse.memberCount,
          categoryId: savingFundResponse.categoryId,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSavingFund();
  }, [id, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Đảm bảo số lượng thành viên là số nguyên dương
    if (name === "memberCount" && value !== "") {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue) || parsedValue <= 0) {
        toast.error("Số lượng thành viên phải là số nguyên dương!");
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };


  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, categoryId });
  };

  const handleAmountInput = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, [name]: formattedValue });
  };

  const formatCurrency = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => value.replace(/[^\d]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = [];

    if (!formData.name.trim()) {
      errors.push("Tên quỹ không được bỏ trống!");
    }
    if (!formData.targetAmount) {
      errors.push("Số tiền mục tiêu không được bỏ trống!");
    }
    if (!formData.startDate) {
      errors.push("Ngày bắt đầu không được bỏ trống!");
    }
    if (!formData.endDate) {
      errors.push("Ngày kết thúc không được bỏ trống!");
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      errors.push("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
    }
    if (!formData.memberCount || parseInt(formData.memberCount, 10) <= 0) {
      errors.push("Số lượng thành viên phải là số nguyên dương!");
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      const payload = {
        ...formData,
        currentAmount: unformatCurrency(formData.currentAmount),
        targetAmount: unformatCurrency(formData.targetAmount),
      };

      if (!id) {
        throw new Error("Fund ID is undefined");
      }

      await editSavingsFund(id, payload);
      navigate(`/savings-fund/detail/${id}`);
      toast.success("Cập nhật thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại, vui lòng thử lại!");
    }
  };
  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }
  return (
    <div className="container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a className="text-secondary" href="/savings-fund/list">Quỹ tiết kiệm</a></li>
          <li className="breadcrumb-item active" aria-current="page">Sửa quỹ tiết kiệm</li>
        </ol>
      </nav>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Tên quỹ</label>
              <input
                type="text"
                id="name"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="targetAmount" className="form-label">Số tiền mục tiêu</label>
                <input
                  type="text"
                  id="targetAmount"
                  className="form-control"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleAmountInput}
                />
              </div>

            </div>
            <div className="form-group col">
              <label htmlFor="memberCount" className="form-label">Số lượng thành viên</label>
              <input
                type="number"
                id="memberCount"
                className="form-control"
                name="memberCount"
                value={formData.memberCount}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="startDate" className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col">
                <label htmlFor="endDate" className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <div className="custom-category-grid-edit">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category._id}
                      className={`custom-category-btn ${category._id === formData.categoryId ? 'active' : ''}`}
                      type="button"
                      onClick={() => handleCategorySelect(category._id)}
                    >
                      <img src={category.image} alt={category.name} />
                      <p>
                        {category.name.length > 17
                          ? `${category.name.substring(0, 17)}...`
                          : category.name}
                      </p>
                    </button>
                  ))
                ) : (
                  <p>Không có danh mục nào</p>
                )}
              </div>
            </div>
            <div className="text-end">
              <button className="btn btn-primary me-2" type="submit">Cập nhật</button>
              <Link className="btn btn-secondary" to={`/savings-fund/detail/${id}`}>Quay lại</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSavingsFund;
