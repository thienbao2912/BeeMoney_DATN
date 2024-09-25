import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './budget-detail.css';
import VerticalBarChart from './VerticalBarChart';
import { getBudgetById, getExpensesForBudget } from '../../../../service/Budget';
import { Spinner } from 'react-bootstrap';

const BudgetDetail = () => {
    const { budgetId } = useParams();
    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBudgetDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const userId = localStorage.getItem('userId');
                if (userId && budgetId) {
                    const responseBudget = await getBudgetById(budgetId, userId);
                    const fetchedBudget = responseBudget.data;

                    if (!fetchedBudget || fetchedBudget._id !== budgetId) {
                        throw new Error('Ngân sách không tồn tại');
                    }
                    const responseExpenses = await getExpensesForBudget(budgetId, userId);
                    if (!responseExpenses || !Array.isArray(responseExpenses.expenses)) {
                        throw new Error('Dữ liệu chi tiêu không có sẵn');
                    }
                    const fetchedExpenses = responseExpenses.expenses;
                    setBudget(fetchedBudget);
                    setExpenses(fetchedExpenses);
                } else {
                    throw new Error('ID người dùng hoặc ID ngân sách bị thiếu');
                }
            } catch (err) {
                setError(`Có lỗi xảy ra khi tải chi tiết ngân sách: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetDetails();
    }, [budgetId]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                <p className="mt-2 primary">Loading...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!budget) {
        return <p>Không có dữ liệu ngân sách</p>;
    }

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    const formatDate = (date) => new Intl.DateTimeFormat('vi-VN').format(new Date(date));

    const totalExpenses = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0) || 0;
    const totalDays = Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / (1000 * 60 * 60 * 24));
    const dailyBudget = budget.amount / totalDays;

    const daysPassed = Math.ceil((new Date() - new Date(budget.startDate)) / (1000 * 60 * 60 * 24));
    const actualDailyExpense = daysPassed > 0 ? totalExpenses / daysPassed : 0;

    const today = new Date();
    const endDate = new Date(budget.endDate);
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    return (
        <div className="categories-overview">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">Chi tiết ngân sách</li>
                    <li className="breadcrumb-item"><a href="/budget" className='text-dark'>Ngân sách</a></li>
                </ol>
            </nav>
            <div className="row mt-3">
                <div className="col-md-6 mb-3">
                    <div className="income-overview card" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <table className="table table-borderless">
                                    <thead>
                                        <tr>
                                            <td className="d-flex justify-content-center align-items-center">
                                                {budget.categoryId?.image && <img src={budget.categoryId.image} alt="Category" style={{ width: 50 }} className="me-2" />}
                                            </td>
                                            <td className="justify-content-between align-items-center">
                                                <h4 className="mb-0"><strong>{budget.categoryId?.name || 'Chưa có tên danh mục'}</strong></h4>
                                            </td>
                                            <td><strong><span className="d-block text-end large-text">{formatCurrency(budget.amount)}</span></strong></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td><strong>Đã chi</strong></td>
                                            <td className="d-block text-end text-warning"><strong><span>{formatCurrency(totalExpenses)}</span></strong></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td><strong>Còn lại</strong></td>
                                            <td><strong><span className="d-block text-end text-success">{formatCurrency(budget.remainingBudget || 0)}</span></strong></td>
                                        </tr>
                                        <tr>
                                            <td className="d-flex justify-content-center align-items-center">
                                                <div style={{ color: "#000000" }}>
                                                    <i className="far fa-calendar-alt"></i>
                                                </div>
                                            </td>
                                            <td>Thời gian</td>
                                            <td className='d-block text-end'>{`${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}`}</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td className='d-block text-start'>Kéo dài: {totalDays} ngày</td>
                                            <td>
                                                <span className='d-block text-end'>Còn lại: {daysRemaining} ngày</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <div className="income-overview card" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Nên chi hàng ngày</span>
                                <span className="d-block text-end">{formatCurrency(dailyBudget || 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Thực tế chi tiêu hàng ngày</span>
                                <span className="d-block text-end">{formatCurrency(actualDailyExpense || 0)}</span>
                            </div>
                            <div className="mt-2">
                                <span>Danh sách giao dịch</span>
                                <ul className="list-group mt-2">
                                    {expenses.length > 0 ? (
                                        expenses.map(transaction => (
                                            <li key={transaction._id} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>{transaction.description || 'Không có mô tả'}</span>
                                                    <span className="text-end">{formatCurrency(transaction.amount)}</span>
                                                </div>
                                                <div>
                                                    <small className="text-muted">{formatDate(transaction.date)}</small>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-group-item">Không có giao dịch nào</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chart-container mt-3">
                <VerticalBarChart
                    totalBudget={budget.amount}
                    totalExpenses={totalExpenses}
                    startDate={formatDate(budget.startDate)}
                    endDate={formatDate(budget.endDate)}
                    categoryName={budget.categoryId?.name || 'Chưa có tên danh mục'}
                />
            </div>
        </div>
    );
};

export default BudgetDetail;
