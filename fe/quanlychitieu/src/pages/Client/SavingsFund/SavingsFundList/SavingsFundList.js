import React, { useEffect, useState } from 'react';
import { getAllSavingsFunds, deleteSavingsFund } from '../../../../service/SavingFund';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import AcceptInvite from '../AcceptInvite';
import { Modal, Button } from 'react-bootstrap';
const SavingsFundList = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error messages
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const data = await getAllSavingsFunds();
        setFunds(data);
      } catch (error) {
        console.error("Error fetching funds:", error);
        setError("Không thể tải quỹ tiết kiệm.");
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa quỹ này?');
    if (confirmDelete) {
      try {
        await deleteSavingsFund(id);
        setFunds(prevFunds => prevFunds.filter(fund => fund._id !== id));
      } catch (error) {
        console.error("Error deleting fund:", error);
        setError("Không thể xóa quỹ tiết kiệm.");
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/savings-fund/detail/${id}`);
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
        <Button variant="btn btn heets-gradient-danger mt-2 text-white" onClick={handleShowModal}>
        <i class="fa-solid fa-user-group"></i> Tham gia quỹ
              </Button>
      <h5 className="mb-1 mt-4 text-primary">Danh sách quỹ tiết kiệm</h5>
      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="thead-light">
            <tr>
              <th>Tên quỹ</th>
              <th>Số tiền hiện tại</th>
              <th>Mục tiêu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {funds.length === 0 ? (
              <tr>
                <td colSpan="4">Không có quỹ nào hiện có.</td>
              </tr>
            ) : (
              funds.map(fund => (
                <tr key={fund._id}>
                  <td>{fund.name}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fund.currentAmount)}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fund.targetAmount)}</td>
                  <td>
                    <button 
                      onClick={() => handleViewDetails(fund._id)} 
                      className="btn btn-info me-2"
                    >
                      <FontAwesomeIcon icon={faEye}     />
                    </button>

                    <button 
                      onClick={() => handleDelete(fund._id)} 
                      className="btn btn-danger"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


 

<Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tham gia quỹ tiết kiệm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <AcceptInvite  />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SavingsFundList;
