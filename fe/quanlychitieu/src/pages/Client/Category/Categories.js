import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAllCategories, deleteCategory } from '../../../service/Category';
import ConfirmationModal from '../SavingGoals/ConfirmationModal/ConfirmationModal';
import './Categories.css'; // Import the CSS file

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('expense'); // State to track the active tab
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchCategories = async () => {
            setIsFetching(true);
            try {
                const data = await getAllCategories();
                console.log('Fetched categories:', data.data);
                const sortedCategories = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setCategories(sortedCategories);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchCategories();
    }, []);

    const handleDeleteCategory = async (id) => {
        try {
            console.log('Deleting category with id:', id);
            const response = await deleteCategory(id);
            setConfirmationModalOpen(false);
            console.log('Delete response:', response);
            if (response.message === 'Đã xóa thành công') {
                setCategories(categories.filter(category => category._id !== id));
            } else {
                console.error('Lỗi khi xóa danh mục:', response.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
        }
    };

    const openConfirmationModal = (goalId) => {
        setGoalToDelete(goalId);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setGoalToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset lại trang hiện tại về 1 khi thay đổi tab
    };

    const totalPages = Math.ceil(categories.filter(category => category.type === activeTab).length / itemsPerPage);
    const pageNumbers = [...Array(totalPages).keys()].map(num => num + 1);

    const filteredCategories = categories
        .filter(category => category.type === activeTab)
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">Danh mục</li>
                    <li className="breadcrumb-item">
                        <a href="/add-category" className='text-dark'>Thêm danh mục</a>
                    </li>
                </ol>
            </nav>
            <h3>Quản lý danh mục</h3>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="btn-group">
                    <button
                        className={`btn btn-lg ${activeTab === 'expense' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}
                        style={{ minWidth: '6rem' }}
                        onClick={() => handleTabChange('expense')}
                    >
                        Chi tiêu
                    </button>
                    <button
                        className={`btn btn-lg ${activeTab === 'income' ? 'btn-primary' : 'btn-outline-primary'} mr-2`}
                        style={{ minWidth: '6rem' }}
                        onClick={() => handleTabChange('income')}
                    >
                        Thu nhập
                    </button>
                </div>
                <button
                    className="btn-custom-size"
                    onClick={() => window.location.href = '/add-category'}
                >
                    <img src="images/add.png" alt="Add" />
                    Thêm mới
                </button>
            </div>
            <div className="row">
                <div className="card-body">
                    {isFetching ? (
                        <div className="text-center mt-5">
                            <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                            <p className="mt-2 primary">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {filteredCategories.length > 0 ? (
                                <>
                                    <div className="table-responsive">
                                        <table className="table text-center">
                                            <thead>
                                                <tr>
                                                    <th>Hình ảnh</th>
                                                    <th>Danh mục</th>
                                                    <th>Phân loại</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCategories.map(item => (
                                                    <tr key={item._id}>
                                                        <td>
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} width="50" />
                                                            )}
                                                        </td>
                                                        <td>{item.name}</td>
                                                        <td>{item.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</td>
                                                        <td>
                                                            {item.userId.role === 'user' && (
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="btn btn-link dropdown-toggle"
                                                                        type="button"
                                                                        id={`dropdownMenuButton-${item._id}`}
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded="false"
                                                                    >
                                                                        <i className="fa-solid fa-ellipsis"></i>
                                                                    </button>
                                                                    <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${item._id}`}>
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item"
                                                                                onClick={() => window.location.href = `/edit-category/${item._id}`}
                                                                            >
                                                                                Sửa
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item"
                                                                                onClick={() => openConfirmationModal(item._id)}
                                                                            >
                                                                                Xóa
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4">
                                        {pageNumbers.map(number => (
                                            <button
                                                key={number}
                                                className={`page-btn ${number === currentPage ? 'page-btn-active' : ''}`}
                                                onClick={() => setCurrentPage(number)}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">Không có dữ liệu</div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={closeConfirmationModal}
                    onConfirm={() => {
                        if (goalToDelete) handleDeleteCategory(goalToDelete);
                    }}
                    message="Bạn có chắc chắn muốn xóa mục tiêu này?"
                />
            )}
        </div>
    );
};

export default Categories;