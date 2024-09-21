import React, { useEffect, useState } from 'react';
import { getAllTransactions, deleteTransaction } from '../../../../../service/Transaction';
import ConfirmationModal from '../../../SavingGoals/ConfirmationModal/ConfirmationModal'; 
import { Link } from 'react-router-dom'; 

const IncomeList = () => {
    const [incomes, setIncomes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [itemsPerPage] = useState(5);
    const userId = localStorage.getItem('userId'); 

    useEffect(() => {
        const fetchIncomes = async () => {
            setLoading(true);
            try {
                const data = await getAllTransactions('income', userId);
                if (Array.isArray(data)) {
                    const sortedIncomes = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setIncomes(sortedIncomes);
                } else {
                    throw new Error('Unexpected data format');
                }
            } catch (error) {
                console.error('Error fetching incomes:', error.response ? error.response.data : error.message);
                setError('Failed to fetch incomes. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchIncomes();
    }, [userId]);

    const handleDelete = async (incomeId) => {
        try {
            await deleteTransaction(incomeId);
            setConfirmationModalOpen(false);
            const updatedIncomes = await getAllTransactions('income', userId);
            const sortedIncomes = updatedIncomes.sort((a, b) => new Date(b.date) - new Date(a.date));
            setIncomes(sortedIncomes || []);
        } catch (error) {
            console.error('Error deleting income:', error.response ? error.response.data : error.message);
            setError('Failed to delete income. Please try again later.');
        }
    };
  
    const openConfirmationModal = (goalId) => {
        setGoalToDelete(goalId);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setGoalToDelete(null);
        setConfirmationModalOpen(false);
    }
    const indexOfLastIncome = currentPage * itemsPerPage;
    const indexOfFirstIncome = indexOfLastIncome - itemsPerPage;
    const currentIncomes = incomes.slice(indexOfFirstIncome, indexOfLastIncome);
    const totalPages = Math.ceil(incomes.length / itemsPerPage);

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
                    <li className="breadcrumb-item active" aria-current="page">Danh sách thu nhập</li>
                    <li className="breadcrumb-item">
                        <Link className='text-secondary' to="/income/add">Thêm thu nhập</Link>
                    </li>
                </ol>
            </nav>
            <div className="text-center mt-4 mb-4">
                <Link to="/income/add" className="primary">
                    <i className="fa fa-plus"></i> Thêm thu nhập
                </Link>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table text-center">
                            <thead>
                                <tr>
                                    <th scope="col" className="text-secondary text-xxs">Danh mục</th>
                                    <th scope="col" className="text-secondary text-xxs font-weight-bolder opacity-7">Ghi chú</th>
                                    <th scope="col" className="text-secondary text-xxs font-weight-bolder opacity-7">Số tiền</th>
                                    <th scope="col" className="text-secondary text-xxs font-weight-bolder opacity-7">Ngày</th>
                                    <th scope="col" className="text-secondary text-xxs font-weight-bolder opacity-7">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentIncomes.length > 0 ? (
                                    currentIncomes.map(income => (
                                        <tr key={income._id}>
                                            <td className="align-middle">
                                                <div className="align-items-center justify-content-center">
                                                    {income.categoryId && income.categoryId.image ? (
                                                        <img
                                                            src={income.categoryId.image}
                                                            alt={income.categoryId.name}
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
                                                            {income.categoryId ? income.categoryId.name : 'Danh mục không tồn tại'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-secondary">{income.description}</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="text-success"> {Number(income.amount) < 0
                                                        ? `${Number(income.amount).toLocaleString()} đ`
                                                        : `+ ${Number(income.amount).toLocaleString()} đ`
                                                    }</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="custom-date-style">{new Date(income.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="align-middle text-center">
                                                <button className="btn btn-link p-0 text-danger">
                                                    <Link to={`/income/edit/${income._id}`} className="me-2" aria-label="Edit">
                                                        <i className="fa fa-edit text-success" />
                                                    </Link>
                                                </button>
                                                <button
                                                    className="btn btn-link p-0 text-danger"
                                                    onClick={() => openConfirmationModal(income._id)}
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
                                            <p className="primary">Chưa có thu nhập</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="pagination text-center mt-4">
                <button 
                    className="btn btn-secondary" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <i className="fa-solid fa-backward"></i>
                </button>
                <span className="mx-2">{currentPage} / {totalPages}</span>
                <button 
                    className="btn btn-secondary" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <i className="fa-solid fa-forward"></i>
                </button>
            </div>
            {isConfirmationModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={closeConfirmationModal}
                    onConfirm={() => {
                        if (goalToDelete) handleDelete(goalToDelete);
                    }}
                    message="Bạn có chắc chắn muốn xóa mục tiêu này?"
                />
            )}
        </div>
    );
};

export default IncomeList;
