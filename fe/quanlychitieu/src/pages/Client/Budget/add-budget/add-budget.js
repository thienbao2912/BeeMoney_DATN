import React, { useState, useEffect } from 'react';
import { getCategories, getAllBudgets, createBudget } from '../../../../service/Budget'; // Import service functions
import { Spinner } from 'react-bootstrap'; // Import Spinner component from react-bootstrap
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import "./add-budget.css";

const AddBudget = () => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories
    const [loadingBudgets, setLoadingBudgets] = useState(true); // Loading state for budgets
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            startDate: '',
            endDate: '',
            amount: '',
            categoryId: ''
        }
    });

    const categoryId = watch('categoryId');

    useEffect(() => {
        // Fetch categories and budgets when component mounts
        const fetchData = async () => {
            try {
                const categoryResponse = await getCategories();
                const expenseCategories = categoryResponse.data ? categoryResponse.data.filter(cat => cat.type === 'expense') : [];
                setCategories(expenseCategories);
                setLoadingCategories(false);

                const userId = localStorage.getItem('userId');
                if (userId) {
                    const budgetResponse = await getAllBudgets(userId);
                    console.log('Budget Response:', budgetResponse); // Debug line
                    const updatedBudgets = Array.isArray(budgetResponse) ? budgetResponse.map(budget => ({
                        ...budget,
                        categoryId: expenseCategories.find(cat => cat._id === (budget.categoryId ? budget.categoryId._id : null)) || { name: 'Danh mục đã biến mất', image: null }
                    })) : [];

                    // Debugging the createdAt field
                    console.log('Budgets with createdAt:', updatedBudgets);

                    // Sort budgets by createdAt in descending order and limit to 5
                    const sortedBudgets = updatedBudgets
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5);

                    setBudgets(sortedBudgets);
                    setLoadingBudgets(false);
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching data:', err);
                setLoadingCategories(false);
                setLoadingBudgets(false);
            }
        };

        fetchData();
    }, []);


    const validateDates = (startDate, endDate) => {
        if (new Date(startDate) > new Date(endDate)) {
            return 'Ngày bắt đầu không thể lớn hơn ngày kết thúc';
        }
        return true;
    };

    const formatCurrency = (value) => {
        const cleanedValue = value.replace(/,/g, ''); // Remove existing commas
        if (isNaN(cleanedValue)) return '';
        const parts = cleanedValue.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        // Validate dates
        const dateValidationError = validateDates(data.startDate, data.endDate);
        if (dateValidationError !== true) {
            setError(dateValidationError);
            setLoading(false);
            return;
        }

        const userId = localStorage.getItem('userId');

        const budgetData = {
            categoryId: data.categoryId,
            startDate: data.startDate,
            endDate: data.endDate,
            amount: parseFloat(data.amount.replace(/,/g, '')), // Convert formatted string to number
            userId
        };

        try {
            await createBudget(budgetData);
            window.location.reload(); // Reload the page after successful update
        } catch (err) {
            setError('Có lỗi xảy ra khi thêm ngân sách');
            console.error('Error creating budget:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        let value = e.target.value;
        // Remove all non-digit characters except decimal points
        value = value.replace(/[^0-9.]/g, '');
        // Remove multiple decimal points
        if ((value.match(/\./g) || []).length > 1) {
            value = value.replace(/\.(?=.*\.)/, '');
        }
        if (value) {
            // Ensure the value is not negative
            setValue('amount', formatCurrency(value));
        } else {
            setValue('amount', '');
        }
    };

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="categories-overview">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">Thêm ngân sách</li>
                    <li className="breadcrumb-item">
                        <Link className='text-secondary' to="/budget">Danh sách ngân sách</Link>
                    </li>
                </ol>
            </nav>

            <div className="row mt-3">
                <div className="col-md-6 mb-3">
                    <div className="income-overview card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-row">
                                    <div className="form-group col">
                                        <label htmlFor="startDate">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            className="form-control"
                                            {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                                        />
                                        {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
                                    </div>
                                    <div className="form-group col">
                                        <label htmlFor="endDate">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            className="form-control"
                                            {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                                        />
                                        {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="amount">Số tiền ngân sách</label>
                                    <input
                                        type="text"
                                        id="amount"
                                        className="form-control"
                                        {...register('amount', {
                                            required: 'Số tiền ngân sách là bắt buộc',
                                            min: { value: 1, message: 'Số tiền phải lớn hơn 0' },
                                            pattern: { value: /^\d{1,3}(,\d{3})*(\.\d+)?$/, message: 'Định dạng số tiền không hợp lệ' }
                                        })}
                                        onChange={handleAmountChange} // Update change handler
                                    />
                                    {errors.amount && <p className="text-danger">{errors.amount.message}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Danh mục</label>
                                    <div className="category-buttons">
                                        {loadingCategories ? (
                                            <div className="text-center mt-5">
                                                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                                                <p className="mt-2 primary">Loading...</p>
                                            </div>
                                        ) : categories.length > 0 ? (
                                            <>
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat._id}
                                                        className={`btn btn-secondary ${categoryId === cat._id ? 'active' : ''}`}
                                                        type="button"
                                                        onClick={() => setValue('categoryId', cat._id)}
                                                    >
                                                        <img src={cat.image} alt={cat.name} />
                                                        <p>{truncateText(cat.name, 15)}</p>
                                                    </button>
                                                ))}
                                                <button className="btn btn-secondary" type="button">
                                                    <Link className="text-dark d-flex align-items-center" to="/add-category" style={{ textDecoration: 'none' }}>
                                                        <img src='../images/add.png' alt="Add" style={{ marginRight: '5px' }} />
                                                        Thêm
                                                    </Link>
                                                </button>
                                            </>
                                        ) : (
                                            <p>Không có danh mục nào</p>
                                        )}
                                    </div>
                                    {errors.categoryId && <p className="text-danger">{errors.categoryId.message}</p>}
                                </div>
                                <button className="btn btn-primary w-100 text-center" type="submit" disabled={loading}>
                                    {loading ? 'Đang thêm...' : 'Thêm ngân sách'}
                                </button>
                                {error && !loading && <div className="alert alert-danger mt-3">{error}</div>}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <div className="income-overview card">
                        <div className="card-body">
                            <h5 className="mb-4">Danh sách ngân sách</h5>
                            {loadingBudgets ? (
                                <div className="text-center mt-5">
                                    <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                                    <p className="mt-2 primary">Loading...</p>
                                </div>
                            ) : budgets.length > 0 ? (
                                <div className="row mt-3">
                                    {budgets.map(budget => (
                                        <div key={budget._id} className="col-md-12 mb-3">
                                            <div className="budget-card card">
                                                <div className="card-body d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        {budget.categoryId && budget.categoryId.image ? (
                                                            <img
                                                                src={budget.categoryId.image}
                                                                alt={budget.categoryId.name}
                                                                className="category-image"
                                                            />
                                                        ) : (
                                                            <div className="placeholder-image" />
                                                        )}
                                                        <div className="ml-3">
                                                            <h6 className="mb-0">{truncateText(budget.categoryId.name || 'Danh mục đã biến mất', 20)}</h6>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-success mb-0">{Number(budget.amount).toLocaleString()} đ</p>
                                                        <p className="text-secondary mb-0">
                                                            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-right mt-3">
                                        <Link to="/budget" className="btn btn-link">Xem tất cả</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center primary mt-4">
                                    <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                                    <p>Chưa có ngân sách</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBudget;
