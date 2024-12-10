import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserSavingsGoals, getCategories } from '../../../../service/SavingsFund';
import { Card, Row, Col, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AcceptInvite from '../AcceptInvite';
import { Badge } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
const ITEMS_PER_PAGE = 4;

const SavingsGoalsList = ({ userId }) => {
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
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
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleViewDetails = (id) => {
        navigate(`/savings-fund/detail/${id}`);
    };
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                {/* Nút "Tham gia quỹ" */}
                <Button
                    variant="primary"
                    onClick={handleShowModal}
                    className="mb-3"
                >
                    Tham gia quỹ
                </Button>

                {/* Nút dấu cộng */}
                <Button
                    onClick={handleAddGoal}
                    className="mb-3"
                    variant="primary"
                    style={{
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                    }}
                  >
                    <FaPlus style={{ margin: "0", fontSize: "20px" }} />
                </Button>
            </div>
            {goals.length === 0 && <Alert variant="info">Không có mục tiêu tiết kiệm nào.</Alert>}
            <Row className="g-3">
                {currentGoals.map((goal) => (
                    <Col key={goal._id} md={6} lg={6} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Body className="d-flex flex-column justify-content-between">
                                {/* Header Section */}
                                <Row className="align-items-center mb-3">
                                    {/* Image and Name */}
                                    <Col xs={6} className="d-flex align-items-center">
                                        <div
                                            className="d-flex justify-content-center align-items-center rounded me-2"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                backgroundColor: "#eaf4fc",
                                            }}
                                        >
                                            <img
                                               src={goal.categoryId.image|| '/images/chicken.png'}
                                               alt={goal.categoryId.name || 'Ảnh mục tiêu'}
                                                className="img-fluid rounded"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                        <span className="fw-bold">{goal.name || "Tên mục tiêu"}</span>
                                    </Col>

                                    <Col xs={6} className="text-end">
                                        <div>
                                            <i className="bi bi-cash-stack me-1"></i>
                                            {goal.currentAmount.toLocaleString()} đ /{" "}
                                            {goal.targetAmount.toLocaleString()} đ
                                        </div>
                                        <div>
                                            <i className="bi bi-people-fill me-1"></i>
                                            {goal.members.length || "0"} người
                                        </div>
                                    </Col>
                                </Row>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div
                                        className="progress"
                                        style={{ height: "10px", backgroundColor: "#f1f1f1" }}
                                    >
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                                                backgroundColor: `hsl(${Math.min(((goal.currentAmount / goal.targetAmount) * 100), 100) * 1.5}, 100%, ${Math.max(50 - ((goal.currentAmount / goal.targetAmount) * 100) * 0.1, 20)}%)`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-muted mt-1" style={{ fontSize: "0.875rem" }}>
                                        {Math.min(
                                            (goal.currentAmount / goal.targetAmount) * 100,
                                            100
                                        )
                                            .toFixed(0)
                                            .replace(".", "")
                                        }
                                        %
                                    </div>
                                </div>


                                {/* Footer Section */}
                                <div className="d-flex justify-content-between align-items-center">

                                    <div>
                                        <Button
                                            variant="link"
                                            className="text-primary p-0 me-2 align-items-center"
                                            onClick={() => handleViewDetails(goal._id)}
                                        >
                                            Xem chi tiết
                                        </Button>

                                    </div>
                                </div>
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
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Tham gia quỹ tiết kiệm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AcceptInvite />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SavingsGoalsList;
