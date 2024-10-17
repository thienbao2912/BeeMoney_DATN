import React, { useEffect, useState } from 'react';
import { getCategories, getSavingsFundById, updateSavingFundAmount, getUserProfile } from '../../../../service/SavingsFund';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { Cookies } from 'react-cookie';
import MemberList from '../MemberList';
import TransactionList from '../TransactionList';
import './DetailPage.css'
import axios from 'axios';

const FundDetail = () => {
  const [fund, setFund] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryImage, setCategoryImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);  // Control invite modal
  const [contributionAmount, setContributionAmount] = useState('');
  const [note, setNote] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactionUsers, setTransactionUsers] = useState([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi hiển thị categories', error);
        setError('Lỗi hiển thị categories');
      }
    };

    fetchCategories();
  }, []);




  useEffect(() => {
    const fetchFund = async () => {
      try {
        const fundData = await getSavingsFundById(id);
        setFund(fundData);
        console.log(fundData);

        const category = categories.find(cat => cat._id === fundData.categoryId);
        if (category) {
          setCategoryImage(category.image);
        }


      } catch (error) {
        console.error('Lỗi hiển thị chi tiết quỹ tiết kiệm:', error);
        setError('Lỗi hiển thị chi tiết quỹ tiết kiệm');
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchFund();
    }
  }, [id, categories]);


  ;

  const handleShowContributeModal = () => setShowContributeModal(true);
  const handleCloseContributeModal = () => setShowContributeModal(false);

  //Hiển thị modal mời bạn
  const handleShowInviteModal = () => setShowInviteModal(true);
  //Đóng
  const handleCloseInviteModal = () => setShowInviteModal(false);

  const handleContribute = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = await getUserProfile();
      await updateSavingFundAmount(id, { amount: contributionAmount, note });
      setSuccess('Nạp tiền thành công');
      setShowContributeModal(false);
      setFund((prev) => ({
        ...prev,
        currentAmount: prev.currentAmount + parseFloat(contributionAmount),
        transactions: [
          ...prev.transactions,
          {
            participantId: currentUser._id,
            amount: parseFloat(contributionAmount),
            note,
            date: new Date(),
          },
        ],
      }));


      setTransactionUsers((prev) => [...prev, currentUser]);
      setContributionAmount('');
      setNote('');
    } catch (error) {
      console.error('Lỗi nạp tiền:', error);
      setError(null);
      setShowContributeModal(false);
    } finally {
      setLoading(false);
    }
  };


  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !fund) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    try {
      const cookies = new Cookies();
      const token = cookies.get('token');

      await axios.post(
        'http://localhost:4000/api/send-invite-code',
        { email: inviteEmail, fundId: fund._id },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );

      setSuccess('Đã gửi thành công');
      setError(null);
      setInviteEmail('');

    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('Email này không dùng BeeMoney');
      } else {
        setError('Có lỗi xảy ra khi gửi lời mời');
      }
      console.error('Lỗi khi gửi lời mời', error.response ? error.response.data : error.message);
    }
  };
  if (loading) {
    return (
      <div className="text-center mt-5">
        <i className="fa fa-spinner fa-spin fa-2x primary"></i>
        <p className="mt-2 primary">Loading...</p>
      </div>
    );
  }

  if (!fund) return <p>Không có dữ liệu</p>;

  const { currentAmount, targetAmount, endDate } = fund || {};
  const today = new Date();
  const daysLeft = Math.ceil((new Date(endDate) - today) / (1000 * 60 * 60 * 24));
  const percentage = targetAmount ? (currentAmount / targetAmount) * 100 : 0;
  const progressBarClass = percentage >= 50 ? 'heets-gradient-success' : 'heets-gradient-warning';

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="income-overview card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-items-center">
                  <tbody>
                    <tr>
                      <td className="text-center" style={{ width: '100px' }}>
                        <img
                          src={categoryImage || '/images/chicken.png'}
                          width="50"
                          alt="Category"
                        />
                      </td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <h6 className="primary mb-0">{fund.name}</h6>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span className="text-muted small">
                          <i className="fa-solid fa-sack-dollar me-2"></i>
                          {Number(currentAmount).toLocaleString()} đ - {Number(targetAmount).toLocaleString()} đ
                        </span>
                        <div className="progress-wrapper d-flex align-items-center mt-2">
                          <span className="text-muted small me-2">{Math.floor(percentage)}%</span>
                          <div className="progress flex-grow-1">
                            <div
                              className={`progress-bar ${progressBarClass}`}
                              role="progressbar"
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span className="text-muted small">
                          <i className="fas fa-calendar-alt me-2"></i>
                          {new Date(fund.startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                        </span>
                        <br />
                        <span className="text-muted small">
                          <i className="fas fa-calendar-day me-2"></i>
                          còn {daysLeft} ngày
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/savings-fund/edit/${fund._id}`}
                          className="custom-date-style"
                          style={{ backgroundColor: "#711AE1", cursor: "pointer" }}
                          aria-label="Edit"
                        >
                          <i className="fa fa-edit" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='action-style'>
                <span className="custom-date-style me-2" onClick={handleShowContributeModal} style={{ backgroundColor: "lightpink", cursor: "pointer" }}>
                  <i className="fa fa-hand-holding-usd me-2"></i> Nạp tiền
                </span>
                <span className="custom-date-style me-2" onClick={handleShowInviteModal} style={{ cursor: "pointer" }}>
                  <i className="fa fa-user-plus me-2"></i> Mời bạn
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Modal show={showInviteModal} onHide={handleCloseInviteModal}>
  <Modal.Header closeButton>
    <Modal.Title>Mời bạn</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleInvite}>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
      </div>

      {/* Thông báo thành công hoặc lỗi */}
      {success && (
        <div className="custom-alert-success mt-3">
          <i className="fa fa-check-circle"></i>
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-danger mt-3">
          <i className="fa fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="mt-3 text-end">
        <Button variant="secondary" onClick={handleCloseInviteModal}>
          Đóng
        </Button>
        <Button variant="primary" type="submit" className="ms-2">
          Gửi lời mời
        </Button>
      </div>
    </form>
  </Modal.Body>
</Modal>


      <Modal show={showContributeModal} onHide={handleCloseContributeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nạp tiền</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleContribute}>
            <div className="form-group">
              <label>Số tiền</label>
              <input
                type="number"
                className="form-control"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <input
                type="text"
                className="form-control"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="mt-3 text-end">
              <Button variant="secondary" onClick={handleCloseContributeModal}>
                Đóng
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                Nạp tiền
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <div className='row'>
        <TransactionList fundId={id} />
        <MemberList fundId={id} currentAmount={fund.currentAmount} />
      </div>
    </div>
  );
};

export default FundDetail;
