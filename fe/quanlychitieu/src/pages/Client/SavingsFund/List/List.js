import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserSavingsGoals, getCategories } from '../../../../service/SavingsFund';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 4;

const SavingsGoalsList = ({ userId }) => {
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userGoals = await getUserSavingsGoals(userId);
                setGoals(userGoals);

                const categoryList = await getCategories(userId);
                setCategories(categoryList);
            } catch (error) {
                setError('Lỗi khi lấy dữ liệu: ' + (error.message || error));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="text-center mt-5">
                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                <p className="mt-2 primary">Loading...</p>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    const categoryMap = categories.reduce((acc, category) => {
        acc[category._id] = category.image;
        return acc;
    }, {});

    const totalPages = Math.ceil(goals.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentGoals = goals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddGoal = () => {
        navigate('/savings-fund/add');
    };

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb" style={{ marginBottom: "1rem" }}>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page">
                        Danh sách quỹ tiết kiệm
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/savings-fund/add" className="text-dark">
                            Thêm quỹ tiết kiệm
                        </Link>
                    </li>
                </ol>
            </nav>
            <div className="text-center mb-3">
                <Button
                    onClick={handleAddGoal}
                    className="mb-3"
                    variant="primary"
                >
                    Thêm quỹ tiết kiệm
                </Button>
            </div>

            {goals.length === 0 && <Alert variant="info">Không có mục tiêu tiết kiệm nào.</Alert>}

            <Row>
                {currentGoals.map((goal) => (
                    <Col key={goal._id} md={6} className="mb-4">
                        <Card className="shadow-sm d-flex flex-column h-100">
                            <Card.Body className="d-flex flex-column">
                                <Row>
                                    <Col xs={3} className="d-flex flex-column align-items-start">
                                        <img
                                            src={categoryMap[goal.categoryId] || 'default-image-url'}
                                            alt={goal.name || 'Ảnh mục tiêu'}
                                            className="img-fluid rounded mb-4"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                marginBottom: "2rem",
                                            }}
                                        />
                                    </Col>
                                    <Col xs={9}>
                                        <Card.Title>{goal.name || 'Tên mục tiêu'}</Card.Title>
                                        <Card.Text>
                                            <strong>Số tiền mục tiêu:</strong> {goal.targetAmount.toLocaleString() || 'Chưa xác định'} đ
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Số thành viên:</strong> {goal.members.length || '0'} người
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Hoạt động gần nhất:</strong> {goal.members.length > 0 && goal.members.some(member => member.contributedAt) ? new Date(goal.members.filter(member => member.contributedAt)[0].contributedAt).toLocaleDateString() : 'Chưa có hoạt động'}
                                        </Card.Text>
                                    </Col>
                                </Row>
                                <Button variant="primary" className="w-100 mt-3">
                                    Xem chi tiết
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {totalPages > 1 && (
                <div className="pagination mt-4">
                    <ul className="pagination justify-content-center">
                        {[...Array(totalPages)].map((_, index) => (
                            <li
                                key={index + 1}
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                <a
                                    className="page-link"
                                    href="#!"
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SavingsGoalsList;
