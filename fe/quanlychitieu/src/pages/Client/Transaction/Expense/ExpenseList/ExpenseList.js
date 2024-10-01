import React, { useEffect, useState } from 'react';
import { getAllTransactions, deleteTransaction } from '../../../../../service/Transaction';
import { getCategories } from '../../../../../service/Category'; 
import ConfirmationModal from '../../../SavingGoals/ConfirmationModal/ConfirmationModal';
import CustomDropdown from '../../CustomDropdown';
import './ExpenseList.css';
import { Link } from 'react-router-dom';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState(''); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [itemsPerPage] = useState(5);
    const [filterOption, setFilterOption] = useState('all');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const data = await getAllTransactions('expense', userId);
                if (Array.isArray(data)) {
                    const sortedExpenses = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setExpenses(sortedExpenses);
                    setFilteredExpenses(sortedExpenses); // Initially set filteredExpenses to all expenses
                } else {
                    throw new Error('Unexpected data format');
                }
            } catch (error) {
                console.error('Error fetching expenses:', error.response ? error.response.data : error.message);
                setError('Failed to fetch expenses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                const expenseCategories = data.filter(category => category.type === 'expense');
                setCategories(expenseCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchExpenses();
        fetchCategories();
    }, [userId]);

    useEffect(() => {
        applyFilter(filterOption);
    }, [filterOption, selectedCategory, expenses]); 

    const handleDelete = async (expenseId) => {
        try {
            await deleteTransaction(expenseId);
            setConfirmationModalOpen(false);
            const updatedExpenses = await getAllTransactions('expense', userId);
            const sortedExpenses = updatedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            setExpenses(sortedExpenses || []);
        } catch (error) {
            console.error('Error deleting expense:', error.response ? error.response.data : error.message);
            setError('Failed to delete expense. Please try again later.');
        }
    };

    const applyFilter = (option) => {
        let filtered = [...expenses];
        switch (option) {
            case 'top5':
                filtered = filtered.sort((a, b) => b.amount - a.amount).slice(0, 5);
                break;
            case 'bottom5':
                filtered = filtered.sort((a, b) => a.amount - b.amount).slice(0, 5);
                break;
            case 'category':
                if (selectedCategory) {
                    filtered = filtered.filter(expense => expense.categoryId?._id === selectedCategory);
                }
                break;
            default:
                filtered = expenses;
                break;
        }
        setFilteredExpenses(filtered);
        setCurrentPage(1); 
    };

    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
        if (e.target.value !== 'category') {
            setSelectedCategory(''); 
        }
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const openConfirmationModal = (item) => {
        setToDelete(item);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setToDelete(null);
        setConfirmationModalOpen(false);
    }

    const indexOfLastExpense = currentPage * itemsPerPage;
    const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                <p className="mt-2 primary">Loading...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-5">{error}</div>;
    }

    return (
        <div className="categories-overview">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">Danh sách chi tiêu</li>
                    <li className="breadcrumb-item">
                        <Link className='text-secondary' to="/expense/add">Thêm chi tiêu</Link>
                    </li>
                </ol>
            </nav>
            <div className="row align-items-center">
            <div className="col-lg-6 col-md-8 col-sm-12 d-flex align-items-center mb-2">
        <select
            value={filterOption}
            onChange={handleFilterChange}
            className="form-select me-2"
            style={{ width: '200px' }}  
        >
            <option value="all">Tất cả</option>
            <option value="top5">5 chi tiêu lớn nhất</option>
            <option value="bottom5">5 chi tiêu nhỏ nhất</option>
            <option value="category">Lọc theo danh mục</option>
        </select>

        {filterOption === 'category' && (
            <CustomDropdown
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="form-select me-2"
            />
        )}
    </div>

    <div className="col-md-6 mb-3 d-flex justify-content-end">
        <Link to="/expense/add" className="btn btn-primary">
            Thêm chi tiêu
        </Link>
    </div>
</div>
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table text-center">
                            <thead>
                                <tr>
                                    <th scope="col" style={{ width: '20%' }} className="text-secondary text-xxs">Danh mục</th>
                                    <th scope="col" style={{ width: '20%' }} className="text-secondary text-xxs font-weight-bolder opacity-7">Ghi chú</th>
                                    <th scope="col" style={{ width: '20%' }} className="text-secondary text-xxs font-weight-bolder opacity-7">Số tiền</th>
                                    <th scope="col" style={{ width: '20%' }} className="text-secondary text-xxs font-weight-bolder opacity-7">Ngày</th>
                                    <th scope="col" style={{ width: '20%' }} className="text-secondary text-xxs font-weight-bolder opacity-7">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentExpenses.length > 0 ? (
                                    currentExpenses.map(expense => (
                                        <tr key={expense._id}>
                                            <td className="align-middle">
                                                <div className="align-items-center justify-content-center">
                                                    {expense.categoryId && expense.categoryId.image ? (
                                                        <img
                                                            src={expense.categoryId.image}
                                                            alt={expense.categoryId.name}
                                                            width="50"
                                                            height="50"
                                                            className="rounded"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="placeholder-image"
                                                            style={{ width: '50px', height: '50px' }}
                                                        />
                                                    )}
                                                    <div className="ml-2">
                                                        <p className="text-xs text-secondary mb-0 font-weight-bold">
                                                            {expense.categoryId ? expense.categoryId.name : 'Danh mục không tồn tại'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-secondary">{expense.description}</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-danger">
                                                    {Number(expense.amount) < 0
                                                        ? `${Number(expense.amount).toLocaleString()} đ`
                                                        : `- ${Number(expense.amount).toLocaleString()} đ`
                                                    }
                                                </span>
                                            </td>

                                            <td className="align-middle">
                                                <span className="custom-date-style">{new Date(expense.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="align-middle">
                                                <button className="btn btn-link p-0 text-danger">
                                                    <Link to={`/expense/edit/${expense._id}`} className="me-2" aria-label="Edit">
                                                        <i className="fa fa-edit text-success" />
                                                    </Link>
                                                </button>
                                                <button
                                                    className="btn btn-link p-0 text-danger"
                                                    onClick={() => openConfirmationModal(expense)}
                                                    aria-label="Delete"
                                                >
                                                    <i className="fa fa-trash" />
                                                </button>

                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            <i className="fa-solid fa-circle-exclamation fa-2x primary"></i>
                                            <p className="primary">Chưa có chi tiêu</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="pagination justify-content-center mt-3 flex-wrap">
    {totalPages > 1 && (
        <ul className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button onClick={() => paginate(index + 1)} className="page-link">
                        {index + 1}
                    </button>
                </li>
            ))}
        </ul>
    )}
</div>


            {isConfirmationModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={closeConfirmationModal}
                    onConfirm={() => {
                        if (toDelete) handleDelete(toDelete._id);
                    }}
                    message={`Bạn có chắc chắn muốn xóa chi tiêu <span class="primary">${toDelete?.description}</span> ?`}
                />
            )}
        </div>
    );
};

export default ExpenseList;
