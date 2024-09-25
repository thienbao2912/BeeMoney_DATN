import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllCategories, deleteCategory } from '../../../service/CategorieAdmin';
import Layout from '../../../layouts/AdminLayout';
import { RingLoader } from 'react-spinners';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import ConfirmDeleteModal from '../../../components/Admin/ConfirmDeleteModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalShow, setModalShow] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');  
    const categoriesPerPage = 5;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search).get('search');
        setSearchQuery(query || '');
    }, [location.search]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await getAllCategories(navigate);
                const data = response.data || [];

                const sortedCategories = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const filteredCategories = sortedCategories.filter(category =>
                    category.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (filterType === 'all' || category.type === filterType)
                );

                setCategories(filteredCategories);
                setTotalPages(Math.ceil(filteredCategories.length / categoriesPerPage));
                setDisplayedCategories(filteredCategories.slice(0, categoriesPerPage));

                const urls = {};
                for (const category of filteredCategories) {
                    if (category.image) {
                        try {
                            const imageRef = ref(storage, category.image);
                            const url = await getDownloadURL(imageRef);
                            urls[category._id] = url;
                        } catch (error) {
                            console.error('Error fetching image URL:', error);
                        }
                    }
                }
                setImageUrls(urls);

            } catch (err) {
                setError('Failed to fetch categories.');
                console.error('Fetch categories error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [searchQuery, filterType, navigate]);

    useEffect(() => {
        const indexOfLastCategory = currentPage * categoriesPerPage;
        const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
        setDisplayedCategories(categories.slice(indexOfFirstCategory, indexOfLastCategory));
    }, [currentPage, categories]);

    const handleDeleteCategory = async () => {
        if (categoryToDelete) {
            try {
                await deleteCategory(categoryToDelete._id, navigate);
                setCategories(categories.filter(category => category._id !== categoryToDelete._id));
                setModalShow(false);
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    setError(err.response.data.message || 'Đã xảy ra lỗi khi xóa danh mục.');
                } else {
                    setError('Đã xảy ra lỗi khi xóa danh mục.');
                }
            }
        }
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setModalShow(true);
    };

    const closeDeleteModal = () => {
        setModalShow(false);
        setCategoryToDelete(null);
        setError(null);  
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
      <Layout>
        <div className="container-fluid py-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title">Danh sách loại</h5>
              <Link to="/admin/categories/add" className="btn btn-primary">
                Thêm mới
              </Link>
            </div>
            <div className="container">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="search" className="form-label">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    className="form-control mt-2"
                    id="search"
                    placeholder="Tìm kiếm danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="filter" className="form-label">
                    Lọc theo loại
                  </label>
                  <select
                    id="filter"
                    className="form-select mt-2"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body">
              {isLoading ? (
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
                      <div className="table-responsive">
                        <table className="table table-striped text-center">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Tên</th>
                              <th>Hình ảnh</th>
                              <th>Loại</th>
                              <th>Ghi chú</th>
                              <th>Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedCategories.map((category, index) => (
                              <tr key={category._id || `category-${index}`}>
                                <td className="align-middle">
                                  {(currentPage - 1) * categoriesPerPage +
                                    index +
                                    1}
                                </td>
                                <td className="align-middle">
                                  {category.name}
                                </td>
                                <td className="align-middle">
                                  <img
                                    src={imageUrls[category._id] || ""}
                                    alt={category.name}
                                    style={{ width: "100px" }}
                                  />
                                </td>
                                <td className="align-middle">
                                  {category.type}
                                </td>
                                <td className="align-middle">
                                  {category.description}
                                </td>
                                <td>
                                  <div
                                    style={{ marginTop: "2.1rem" }}
                                    className="dropdown ms-3"
                                  >
                                    <button
                                      className="btn-drop btn btn-sm dropdown-toggle"
                                      type="button"
                                      id={`dropdownMenuButton-${category._id}`}
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
                                      aria-labelledby={`dropdownMenuButton-${category._id}`}
                                    >
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to={`/admin/categories/edit/${category._id}`}
                                        >
                                          Sửa
                                        </Link>
                                      </li>
                                      <li>
                                        <a
                                          className="dropdown-item text-danger"
                                          onClick={() =>
                                            openDeleteModal(category)
                                          }
                                        >
                                          Xóa
                                        </a>
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
                  </div>
                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination justify-content-center">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <li
                            key={i + 1}
                            className={`page-item ${
                              currentPage === i + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <ConfirmDeleteModal
          show={modalShow}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteCategory}
          categoryName={categoryToDelete?.name}
          errorMessage={error}
        />
      </Layout>
    );
};

export default CategoryList;
