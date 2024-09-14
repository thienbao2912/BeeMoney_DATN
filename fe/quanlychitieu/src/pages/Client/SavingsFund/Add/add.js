import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Card, Row, Col, ListGroup } from "react-bootstrap";
import { createSavingsFund, getCategories, getUserSavingsGoals } from '../../../../service/SavingsFund';

const SavingsFundAdd = () => {
    const [categories, setCategories] = useState([]);
    const [recentFunds, setRecentFunds] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingFunds, setIsLoadingFunds] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        defaultValues: {
            name: '',
            targetAmount: '',
            categoryId: '',
            startDate: '',
            endDate: ''
        }
    });

    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategoriesData();
    }, []);

    useEffect(() => {
        const fetchUserSavingsGoals = async () => {
            try {
                const data = await getUserSavingsGoals();
                setRecentFunds(data);
            } catch (error) {
                console.error('Error fetching user savings goals:', error);
            } finally {
                setIsLoadingFunds(false);
            }
        };

        fetchUserSavingsGoals();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                targetAmount: Number(data.targetAmount.replace(/,/g, ''))
            };

            console.log("Sending data:", payload);
            const response = await createSavingsFund(payload);
            console.log("API response:", response);

            const updatedFunds = await getUserSavingsGoals();
            setRecentFunds(updatedFunds);
            reset();
        } catch (error) {
            console.error('Error creating savings fund:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount == null || isNaN(amount)) return '0 VNĐ';
        return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const validateDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= end || 'Ngày bắt đầu không được lớn hơn ngày kết thúc';
    };

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb" style={{ marginBottom: "1rem" }}>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">
                        Thêm quỹ tiết kiệm
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/savings-fund/list" className="text-dark">
                            Danh sách quỹ tiết kiệm
                        </Link>
                    </li>
                </ol>
            </nav>
            <Row>
                <Col md={6}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="p-4" style={{ marginTop: 0 }}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Tên quỹ</label>
                                <input
                                    type="text"
                                    id="name"
                                    {...register('name', { required: 'Tên quỹ là bắt buộc' })}
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="targetAmount" className="form-label">Số tiền mục tiêu</label>
                                <input
                                    type="text"
                                    id="targetAmount"
                                    {...register('targetAmount', {
                                        required: 'Số tiền mục tiêu là bắt buộc',
                                        onChange: (e) => setValue('targetAmount', e.target.value) // Remove formatting
                                    })}
                                    className={`form-control ${errors.targetAmount ? 'is-invalid' : ''}`}
                                />
                                {errors.targetAmount && <div className="invalid-feedback">{errors.targetAmount.message}</div>}
                            </div>

                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label htmlFor="startDate" className="form-label">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                                            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                                        />
                                        {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label htmlFor="endDate" className="form-label">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            {...register('endDate', {
                                                required: 'Ngày kết thúc là bắt buộc',
                                                validate: (value) => validateDateRange(watch('startDate'), value)
                                            })}
                                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                                        />
                                        {errors.endDate && (
                                            <div className="invalid-feedback" style={{ width: '100%' }}>
                                                {errors.endDate.message}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <label htmlFor="categoryId" className="form-label">Danh mục quỹ</label>
                                <Row className="g-2">
                                    {isLoadingCategories ? (
                                        <Col className="text-center">
                                            <div className="text-center mt-5">
                                                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                                                <p className="mt-2 primary">Loading...</p>
                                            </div>
                                        </Col>
                                    ) : (
                                        categories.map((category, index) => (
                                            <Col xs={12} md={4} key={index} className="d-flex justify-content-center mb-2">
                                                <Button
                                                    variant={category._id === watch('categoryId') ? "primary" : "light"}
                                                    className="d-flex align-items-center justify-content-start"
                                                    style={{
                                                        width: "200px",
                                                        padding: "10px 12px",
                                                        fontSize: "0.9rem",
                                                        border: "1px solid #ced4da",
                                                    }}
                                                    onClick={() => setValue('categoryId', category._id)}
                                                >
                                                    <img
                                                        src={category.image}
                                                        alt={category.name}
                                                        style={{
                                                            width: "24px",
                                                            height: "24px",
                                                            marginRight: "8px",
                                                        }}
                                                    />
                                                    {category.name}
                                                </Button>
                                            </Col>
                                        ))
                                    )}
                                </Row>
                                {errors.categoryId && <div className="invalid-feedback d-block" style={{ width: '100%' }}>{errors.categoryId.message}</div>}
                            </div>

                            <Button type="submit" className="w-100" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin"></i> Đang tạo quỹ...
                                    </>
                                ) : (
                                    'Tạo quỹ'
                                )}
                            </Button>
                        </Card>
                    </form>
                </Col>

                <Col md={6}>
                    <Card className="p-4" style={{ marginTop: 0 }}>
                        <div className="mb-3">
                            <Link className="text-secondary" to="/savings-fund/list">
                                Xem tất cả danh sách
                            </Link>
                        </div>
                        <ListGroup>
                            {isLoadingFunds ? (
                                <ListGroup.Item className="text-center">
                                    <div className="text-center mt-5">
                                        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                                        <p className="mt-2 primary">Loading...</p>
                                    </div>
                                </ListGroup.Item>
                            ) : (
                                recentFunds.length > 0 ? (
                                    recentFunds.slice(0, 15).map((fund, index) => {
                                        const fundCategory = categories.find(category => category._id === fund.categoryId);

                                        return (
                                            <ListGroup.Item key={index} className="d-flex align-items-center">
                                                {fundCategory && (
                                                    <>
                                                        <img
                                                            src={fundCategory.image}
                                                            alt={fundCategory.name}
                                                            style={{
                                                                width: "24px",
                                                                height: "24px",
                                                                marginRight: "8px",
                                                            }}
                                                        />
                                                        <span className="flex-grow-1">Quỹ {fund.name}</span>
                                                    </>
                                                )}
                                                <span>{formatCurrency(fund.targetAmount)}</span>
                                            </ListGroup.Item>
                                        );
                                    })
                                ) : (
                                    <ListGroup.Item>Không có dữ liệu</ListGroup.Item>
                                )
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SavingsFundAdd;
