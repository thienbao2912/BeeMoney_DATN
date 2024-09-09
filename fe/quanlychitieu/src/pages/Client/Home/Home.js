import React, { useState, useEffect } from 'react';
import IncomeChart from '../Chart/IncomeChart';
import OutcomeChart from '../Chart/OutcomeChart';
import TotalOverviewChart from '../Chart/TotalOverviewChart';
import { getAllBudgets } from '../../../service/Budget'; // Import service functions
import { getExpensesByCategory, getIncomeByCategory } from '../../../service/Transaction';
import { useNotifications } from '../../../components/Client/Header/NotificationContext'; // Import Context hook

const Home = () => {
    const [expensesData, setExpensesData] = useState([]);
    const [incomeData, setIncomeData] = useState([]);
    const [expensesDataArray, setExpensesDataArray] = useState([]);
    const [incomeDataArray, setIncomeDataArray] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [filterOption, setFilterOption] = useState('all');
    const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
    const [selectedCategory, setSelectedCategory] = useState({ category: null, type: '' });
    const [expenseDetails, setExpenseDetails] = useState([]);
    const [incomeDetails, setIncomeDetails] = useState([]);
    const [showExpenses, setShowExpenses] = useState(true);
    const userId = localStorage.getItem('userId');
    const { setNotifications } = useNotifications(); // Use notification context
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseBudgets = await getAllBudgets(userId);
                console.log('API Response:', responseBudgets); // Log response
                if (responseBudgets) {
                    setBudgets(responseBudgets); // Update with valid response
                    // Check for budgets exceeding the limit
                    const notifications = responseBudgets
                        .filter(budget => budget.remainingBudget < 0)
                        .map(budget => ({
                            id: budget._id,
                            title: `Ngân sách ${budget.categoryId ? budget.categoryId.name : 'Danh mục không xác định'} đã vượt quá giới hạn `,
                            date: new Intl.DateTimeFormat('vi-VN').format(new Date()),
                           
                        }));
                    setNotifications(notifications); // Set notifications
                } else {
                    throw new Error('Invalid response structure');
                }
                const expensesResponse = await getExpensesByCategory(userId);
                const incomeResponse = await getIncomeByCategory(userId);

                const filteredExpenses = filterDataByTime(expensesResponse, filterOption, customDateRange);
                const filteredIncome = filterDataByTime(incomeResponse, filterOption, customDateRange);

                const totalExpenses = filteredExpenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
                const totalIncome = filteredIncome.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

                setTotalExpenses(totalExpenses);
                setTotalIncome(totalIncome);

                const expensesData = aggregateDataByCategory(filteredExpenses);
                const incomeData = aggregateDataByCategory(filteredIncome);

                setExpensesData(expensesData);
                setIncomeData(incomeData);

                if (selectedCategory.category && (expensesData.concat(incomeData).some(data => data.name === selectedCategory.category.name))) {
                    setSelectedCategory(prev => ({
                        ...prev,
                        category: expensesData.find(data => data.name === prev.category?.name) || incomeData.find(data => data.name === prev.category?.name) || null
                    }));
                } else {
                    setSelectedCategory({ category: null, type: '' });
                }

                const sortedExpenses = expensesResponse.sort((a, b) => new Date(b.date) - new Date(a.date));
                const sortedIncome = incomeResponse.sort((a, b) => new Date(b.date) - new Date(a.date));

                console.log("Sorted Expenses:", sortedExpenses);
                console.log("Sorted Income:", sortedIncome);

                const expensesMap = new Map();
                const expenseDetailsList = [];
                sortedExpenses.forEach(item => {
                    if (item.categoryId && item.categoryId.name) {
                        const categoryId = item.categoryId._id;
                        if (!expensesMap.has(categoryId)) {
                            expensesMap.set(categoryId, {
                                name: item.categoryId.name,
                                y: Number(item.amount) || 0,
                                categoryImage: item.categoryId.image || 'default-image-url'
                            });
                        } else {
                            const existingItem = expensesMap.get(categoryId);
                            existingItem.y += Number(item.amount) || 0;
                        }
                    }
                    expenseDetailsList.push({
                        name: item.categoryId?.name || 'Unknown',
                        amount: Number(item.amount) || 0,
                        categoryImage: item.categoryId?.image || 'default-image-url',
                        date: new Date(item.date).toLocaleDateString() || 'No Date',
                        description: item.description || 'No Description'
                    });
                });

                const expensesDataArray = Array.from(expensesMap.values());
                // Aggregate income data
                const incomeMap = new Map();
                const incomeDetailsList = [];
                sortedIncome.forEach(item => {
                    if (item.categoryId && item.categoryId.name) {
                        const categoryId = item.categoryId._id;
                        if (!incomeMap.has(categoryId)) {
                            incomeMap.set(categoryId, {
                                name: item.categoryId.name,
                                y: Number(item.amount) || 0,
                                categoryImage: item.categoryId.image || 'default-image-url'
                            });
                        } else {
                            const existingItem = incomeMap.get(categoryId);
                            existingItem.y += Number(item.amount) || 0;
                        }
                    }
                    incomeDetailsList.push({
                        name: item.categoryId?.name || 'Unknown',
                        amount: Number(item.amount) || 0,
                        categoryImage: item.categoryId?.image || 'default-image-url',
                        date: new Date(item.date).toLocaleDateString() || 'No Date',
                        description: item.description || 'No Description'
                    });
                });

                const incomeDataArray = Array.from(incomeMap.values());

                setExpensesDataArray(expensesDataArray);
                setIncomeDataArray(incomeDataArray);
                setExpenseDetails(expenseDetailsList);
                setIncomeDetails(incomeDetailsList);

            } catch (err) {
                console.error('Error fetching data:', err.response ? err.response.data : err.message);
            }
        };

        fetchData();
    }, [userId, filterOption, customDateRange]);

    const filterDataByTime = (data, option, customRange) => {
        const currentDate = new Date();
        let filteredData = [];

        switch (option) {
            case 'today':
                filteredData = data.filter(item =>
                    new Date(item.date).toDateString() === currentDate.toDateString()
                );
                break;
            case 'this-week':
                const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                filteredData = data.filter(item =>
                    new Date(item.date) >= weekStart
                );
                break;
            case 'this-month':
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                filteredData = data.filter(item =>
                    new Date(item.date) >= monthStart
                );
                break;
            case 'this-year':
                const yearStart = new Date(currentDate.getFullYear(), 0, 1);
                filteredData = data.filter(item =>
                    new Date(item.date) >= yearStart
                );
                break;
            case 'custom':
                if (customRange.startDate && customRange.endDate) {
                    const startDate = new Date(customRange.startDate);
                    const endDate = new Date(customRange.endDate);
                    filteredData = data.filter(item =>
                        new Date(item.date) >= startDate && new Date(item.date) <= endDate
                    );
                }
                break;
            case 'all':
                filteredData = data;
                break;
            default:
                filteredData = data;
        }

        return filteredData;
    };

    const aggregateDataByCategory = (data) => {
        const dataMap = new Map();

        data.forEach(item => {
            if (item.categoryId && item.categoryId.name) {
                const categoryId = item.categoryId._id;
                if (!dataMap.has(categoryId)) {
                    dataMap.set(categoryId, {
                        name: item.categoryId.name,
                        y: Number(item.amount) || 0,
                        categoryImage: item.categoryId.image || 'default-image-url',
                        transactions: [item],
                    });
                } else {
                    const existingItem = dataMap.get(categoryId);
                    existingItem.y += Number(item.amount) || 0;
                    existingItem.transactions.push(item);
                }
            }
        });

        return Array.from(dataMap.values());
    };

    const handleChartClick = (category, type) => {
        setSelectedCategory({ category, type });
    };

    const handleViewDetailsClick = (category, type) => {
        setSelectedCategory({ category, type });
    };

    const renderCategoryDetails = (type) => {
        if (!selectedCategory.category || selectedCategory.type !== type) return null;

        const { category } = selectedCategory;
        const data = type === 'expense' ? expensesData : incomeData;

        const categoryDetails = data.find(data => data.name === category.name);

        return (
            <div className="details-section">
                <h6 className="card-title">Chi tiết {type === 'expense' ? 'chi tiêu' : 'thu nhập'}</h6>
                {categoryDetails && categoryDetails.transactions.length > 0 ? (
                    categoryDetails.transactions.map((item, index) => (
                        <div className="d-flex px-2 py-1 align-items-center justify-content-between border-bottom" key={index}>
                            <div className="me-3 d-flex align-items-center">
                                <img
                                    src={item.categoryId.image || "../images/no.png"}
                                    className="rounded-circle"
                                    alt={item.name}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="text-center flex-grow-1">
                                <h6 className="mb-0">{item.description}</h6>
                                <p className={type === 'expense' ? 'text-danger mb-0' : 'text-success mb-0'}>
                                    {type === 'expense' ? '-' : '+'} {Number(item.amount).toLocaleString()} đ
                                </p>
                            </div>
                            <div className="text-end">
                                <p className="text-secondary mb-0">{new Date(item.date).toLocaleDateString() || 'No Date'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center primary mt-4">
                        <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                        <p>Chưa có {type === 'expense' ? 'chi tiêu' : 'thu nhập'} cho danh mục này</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mt-4 mb-5">
                        <div className="row mb-4">
                <div className="col-md-3">
                    <select className="form-select" value={filterOption} onChange={e => setFilterOption(e.target.value)}>
                        <option value="all">Hiển thị tất cả</option>
                        <option value="today">Hôm nay</option>
                        <option value="this-week">Tuần này</option>
                        <option value="this-month">Tháng này</option>
                        <option value="this-year">Năm này</option>
                        <option value="custom">Tùy chọn</option>
                    </select>
                </div>
                {filterOption === 'custom' && (
                    <div className="col-md-6">
                        <div className="d-flex">
                            <input
                                type="date"
                                className="form-control me-2"
                                value={customDateRange.startDate}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                            />
                            <input
                                type="date"
                                className="form-control"
                                value={customDateRange.endDate}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="row mt-3">
                <div className="col-md-6 mb-3">
                    <div className="total-overview card">
                        <div className="card-body">
                            <h5 className="card-title">Tổng Quan</h5>
                            <TotalOverviewChart
                                totalIncome={totalIncome}
                                totalExpenses={totalExpenses}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <h6 className="text-secondary mb-2">Giao dịch gần đây</h6>

                    <div className="d-flex justify-content-center mb-3">
                        <div className="btn-group btn-group-sm">
                            <button
                                className={`btn ${showExpenses ? 'active' : ''}`}
                                onClick={() => setShowExpenses(true)}
                            >
                                Chi tiêu
                            </button>
                            <button
                                className={`btn ${!showExpenses ? 'active' : ''}`}
                                onClick={() => setShowExpenses(false)}
                            >
                                Thu nhập
                            </button>
                        </div>
                    </div>
                    {showExpenses ? (
                        <>
                            {expenseDetails.slice(0, 2).length > 0 ? (
                                expenseDetails.slice(0, 2).map((expense, index) => (
                                    <div className="history-details d-flex px-2 py-1 align-items-center justify-content-between" key={index}>
                                        <div className="mr-3 d-flex align-items-center">
                                            <img
                                                src={expense.categoryImage ? expense.categoryImage : "../images/no.png"}
                                                alt="Category"
                                            />
                                        </div>
                                        <div className="text-center flex-grow-1">
                                            <h6 className="mb-0">{expense.name}</h6>
                                            <p className="text-danger mb-0"> - {expense.amount.toLocaleString()} đ</p>
                                        </div>
                                        <div className="text-end">
                                            <p className="text-secondary mb-0">{expense.date || 'No Date'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center primary mt-4">
                                    <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                                    <p>Chưa có chi tiêu</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {incomeDetails.slice(0, 2).length > 0 ? (
                                incomeDetails.slice(0, 2).map((income, index) => (
                                    <div className="history-details d-flex px-2 py-1 align-items-center justify-content-between" key={index}>
                                        <div className="mr-3 d-flex align-items-center">
                                            <img
                                                src={income.categoryImage ? income.categoryImage : "../images/no.png"}
                                                alt="Category"
                                            />
                                        </div>
                                        <div className="text-center flex-grow-1">
                                            <h6 className="mb-0">{income.name}</h6>
                                            <p className="text-success mb-0"> + {income.amount.toLocaleString()} đ</p>
                                        </div>
                                        <div className="text-end">
                                            <p className="text-secondary mb-0">{income.date || 'No Date'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center primary mt-4">
                                    <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                                    <p>Chưa có thu nhập</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Chi tiêu</h5>
                            <p className="text-danger fw-bold">Tổng chi tiêu: {totalExpenses.toLocaleString()} đ</p>
                            <OutcomeChart data={expensesData} onClick={(category) => handleChartClick(category, 'expense')} />
                            <h5 className="card-title" style={{marginTop: "1.5rem", marginBottom: "1.5rem"}}>Danh sách chi tiêu</h5>
                            {expensesData.length > 0 ? (
                                expensesData.map((category, index) => (
                                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" key={index}>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={category.categoryImage || "../images/no.png"}
                                                className="rounded-circle me-3"
                                                alt={category.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h6 className="mb-0">{category.name}</h6>
                                                <p className="text-danger mb-0">- {category.y.toLocaleString()} đ</p>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleViewDetailsClick(category, 'expense')}>Xem chi tiết</button>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có chi tiêu</p>
                            )}
                            {renderCategoryDetails('expense')}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Thu nhập</h5>
                            <p className="text-success fw-bold">Tổng thu nhập: {totalIncome.toLocaleString()} đ</p>
                            <IncomeChart data={incomeData} onClick={(category) => handleChartClick(category, 'income')} />
                            <h5 className="card-title" style={{marginTop: "1.5rem", marginBottom: "1.5rem"}}>Danh sách thu nhập</h5>
                            {incomeData.length > 0 ? (
                                incomeData.map((category, index) => (
                                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" key={index}>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={category.categoryImage || "../images/no.png"}
                                                className="rounded-circle me-3"
                                                alt={category.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h6 className="mb-0">{category.name}</h6>
                                                <p className="text-success mb-0">+ {category.y.toLocaleString()} đ</p>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleViewDetailsClick(category, 'income')}>Xem chi tiết</button>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có thu nhập</p>
                            )}
                            {renderCategoryDetails('income')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
