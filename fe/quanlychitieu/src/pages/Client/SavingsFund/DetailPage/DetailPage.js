import React, { useEffect, useState } from 'react';
import { getCategories, getSavingsFundById, updateSavingFundAmount, getUserProfile } from '../../../../service/SavingsFund';
import { useParams, Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { Cookies } from 'react-cookie';
import MemberList from '../MemberList';
import TransactionList from '../TransactionList';
import './DetailPage.css'
import axios from 'axios';
import { toast } from 'react-toastify';
const FundDetail = () => {
  const [fund, setFund] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryImage, setCategoryImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSend, setLoadingSend] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [note, setNote] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { id } = useParams();
  const [transactionUsers, setTransactionUsers] = useState([]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi hiển thị categories', error);
      toast.error('Lỗi hiển thị categories');
    }
  };


  const fetchFund = async () => {
    try {
      const fundData = await getSavingsFundById(id);
      setFund(fundData);
      const category = categories.find(cat => cat._id === fundData.categoryId);
      if (category) {
        setCategoryImage(category.image);
      }
    } catch (error) {
      console.error('Lỗi hiển thị chi tiết quỹ tiết kiệm:', error);
      toast.error('Lỗi hiển thị chi tiết quỹ tiết kiệm')
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchFund();
    }
  }, [id, categories]);


  const formatCurrency = (value) => {
    return Number(value).toLocaleString('vi-VN');
  };

  const unformatCurrency = (value) => {
    return value.replace(/[^\d]/g, '');
  };


  const handleAmountChange = (e) => {
    let value = e.target.value;
    value = unformatCurrency(value);
    if (Number(value) < 0) {
      e.target.value = formatCurrency(0);
    } else {
      setContributionAmount(value);
      e.target.value = formatCurrency(value);
    }
  };

  //Hiển thị modal nạp tiền
  const handleShowContributeModal = () => setShowContributeModal(true);
  //Đóng
  const handleCloseContributeModal = () => setShowContributeModal(false);

  //Hiển thị modal mời bạn
  const handleShowInviteModal = () => setShowInviteModal(true);
  //Đóng
  const handleCloseInviteModal = () => setShowInviteModal(false);

  const handleContribute = async (e) => {
    e.preventDefault();
    setLoading(true);

    const amountToContribute = parseFloat(contributionAmount);
    if (isNaN(amountToContribute) || amountToContribute <= 0) {
      toast.warning('Vui lòng nhập số tiền hợp lệ');
      setLoading(false);
      return;
    }

    if (amountToContribute < 1000) {
      toast.warning('Số tiền ít nhất là 1,000 đồng');
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getUserProfile();
      await updateSavingFundAmount(id, { amount: amountToContribute, note });
      setFund((prevFund) => ({
        ...prevFund,
        currentAmount: prevFund.currentAmount + amountToContribute,
      }));


      setTransactionUsers((prev) => [...prev, currentUser]);


      setContributionAmount('');
      setNote('');
      setShowContributeModal(false);

      toast.success('Nạp tiền thành công');
    } catch (error) {
      if (error.response) {
        console.error('API Error:', error.response.data);
        toast.error(error.response.data.message || 'Có lỗi xảy ra khi nạp tiền');
      } else {
        console.error('Unexpected Error:', error.message || error);
        toast.error('Có lỗi xảy ra khi nạp tiền');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail || !fund) {
      toast.warning('Vui lòng nhập email hợp lệ');
      return;
    }


    setLoadingSend(true);

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

      toast.success('Đã gửi đến thành công');
      setInviteEmail('');
      setShowInviteModal(false)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.warning('Email này không dùng BeeMoney');
      } else if (error.response && error.response.status === 400) {
        toast.warning('Email này đã tham gia');
      }
      else {
        toast.error('Có lỗi xảy ra khi gửi lời mời');
      }
      console.error('Lỗi khi gửi lời mời', error.response ? error.response.data : error.message);
    } finally {
      setLoadingSend(false);
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
  const isExpired = daysLeft < 0;
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
                      <td>
                        <h6
                          style={{
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                            maxWidth: '25ch',

                          }}
                          className="primary mb-0">
                          {fund.name}
                        </h6>
                      </td>



                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span className="text-muted small">
                          <i className="fa-solid fa-sack-dollar me-2"></i>
                          {Number(currentAmount).toLocaleString()} đ / {Number(targetAmount).toLocaleString()} đ
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
                          {isExpired ? "Đã hết hạn" : `còn ${daysLeft} ngày`}
                        </span>

                      </td>
                   <td>
                    <Link className="text-success" to={`/savings-fund/edit/${id}`}> <i class="fa-solid fa-pen-to-square"></i></Link>
                 
                   </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className='action-style'>
                <span
                  className={`custom-date-style me-2 ${daysLeft <= 0 ? 'disabled-style' : ''
                    }`}
                  onClick={daysLeft > 0 ? handleShowContributeModal : null}
                  style={{
                    backgroundColor: daysLeft > 0 ? "#FAEBD7" : "#E0E0E0",
                    color: daysLeft > 0 ? "#F4A460" : "#A0A0A0",
                    borderColor: daysLeft > 0 ? "#F4A460" : "#A0A0A0",
                    cursor: daysLeft > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  <i className="fa fa-hand-holding-usd me-2"></i>
                  Nạp tiền

                </span>
                <span
                  className="custom-date-style me-2"
                  onClick={handleShowInviteModal}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fa fa-user-plus me-2"></i>
                  Mời bạn
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


            {loadingSend && (
              <div className="text-center mt-3">
                <i className="fa fa-spinner fa-spin fa-2x primary"></i>
                <p className="mt-2">Đang gửi lời mời...</p>
              </div>
            )}

            <div className="mt-3 text-end">
              <Button variant="secondary" onClick={handleCloseInviteModal}>
                Đóng
              </Button>
              <Button variant="primary" type="submit" className="ms-2" disabled={loadingSend}>
                {loadingSend ? 'Đang gửi...' : 'Gửi lời mời'}
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
                value={formatCurrency(contributionAmount)}
                onChange={handleAmountChange}
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
