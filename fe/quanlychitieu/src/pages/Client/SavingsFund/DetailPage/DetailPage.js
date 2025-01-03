import React, { useEffect, useState } from 'react';
import { getCategories, getSavingsFundById, updateSavingFundAmount, getUserProfile, deleteSavingsFund } from '../../../../service/SavingsFund';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { Cookies } from 'react-cookie';
import MemberList from '../MemberList';
import TransactionList from '../TransactionList';
import ConfirmationModal from '../../SavingGoals/ConfirmationModal/ConfirmationModal';
import './DetailPage.css'
import axios from 'axios';
import { toast } from 'react-toastify';
const FundDetail = () => {
  const [fund, setFund] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoryImage, setCategoryImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [note, setNote] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { id } = useParams();
  const [transactionUsers, setTransactionUsers] = useState([]);
  const name = localStorage.getItem('userName')
  const [errorMessageShown, setErrorMessageShown] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isOwner, setIsOwner] = useState(false);


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
      const cookies = new Cookies();
      const token = cookies.get('token');
      const response = await fetch(`http://localhost:4000/api/savings-fund/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        // Kiểm tra trạng thái HTTP từ response
        const error = await response.json();
        throw { response: { status: response.status, data: error } };
      }

      const fundData = await response.json();
      console.log('fundData', fundData);
      setFund(fundData.data || fundData);
      setIsOwner(fundData.isOwner);
     
     
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          if (!errorMessageShown) {
            toast.warning('Bạn không có quyền truy cập');
            setHasAccess(false);
            setErrorMessageShown(true);
          }
        } else if (status === 404) {
          if (!errorMessageShown) {
            toast.warning('Quỹ tiết kiệm không tồn tại');
            setErrorMessageShown(true);
          }
        } else {
          if (!errorMessageShown) {
            toast.error('Có lỗi xảy ra');
            setErrorMessageShown(true);
          }
        }
      } else {
        if (!errorMessageShown) {
          toast.error('Lỗi kết nối hoặc lỗi không xác định');
          setErrorMessageShown(true);
        }
      }

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleDelete = async (fundId) => {
    setLoading(true);
    try {
      await deleteSavingsFund(fundId);
      toast.success('Xóa quỹ tiết kiệm thành công');
      navigate('/savings-fund/list');
    } catch (error) {
      console.error('Không thể xóa quỹ tiết kiệm:', error);
      toast.error('Không thể xóa quỹ tiết kiệm');
      setConfirmationModalOpen(false);
    } finally {
      setLoading(false);
    }
  };


  const openConfirmationModal = (item) => {
    setGoalToDelete(item);
    setConfirmationModalOpen(true);
  };
  const closeConfirmationModal = () => {
    setGoalToDelete(null);
    setConfirmationModalOpen(false);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {

    fetchFund();

  }, [id, categories]);
  console.log('isOwner:', isOwner);

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
        // Lấy token từ cookie
        const cookies = new Cookies();
        const token = cookies.get('token');

        const response = await fetch(`http://localhost:4000/api/savings-fund/contribute/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ amount: amountToContribute, note }),
        });

        // Xử lý nếu phản hồi không thành công
        if (!response.ok) {
            const errorData = await response.json();
            throw { response: { status: response.status, data: errorData } };
        }

      await fetch("http://localhost:4000/proxy/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        appId: 25582,
        appToken: "DowBN7qkm455dOdSTMH4w0",
        title: "BeeMoney",
        body: ` ${name} mời bạn tham gia quỹ tiết kiệm.`,
        dateSent: "2024-12-26T08:00:00+07:00" ,
        pushData: { yourProperty: "yourPropertyValue" },
        bigPictureURL: "Big picture URL as a string"
        })
      })
      .then(async (response) => {
       
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json(); 
        } else {
          const text = await response.text(); 
          console.warn("Phản hồi không phải JSON:", text);
          return { message: text }; 
        }
      })
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));


      toast.success('Đã gửi đến thành công');
      setInviteEmail('');
      setShowInviteModal(false)
        // Lấy dữ liệu từ phản hồi
        const data = await response.json();

        // Cập nhật UI
        setFund((prevFund) => ({
            ...prevFund,
            currentAmount: prevFund.currentAmount + amountToContribute,
        }));

        const currentUser = await getUserProfile();
        setTransactionUsers((prev) => [...prev, currentUser]);

        setContributionAmount('');
        setNote('');
        setShowContributeModal(false);

        toast.success('Nạp tiền thành công!');
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 400) {
                toast.error('Số dư không đủ để nạp tiền!');
            } else {
                toast.error(error.response.data.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            }
        } else {
            toast.error('Lỗi kết nối hoặc lỗi không xác định.');
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

    toast.success('Lời mời đã được gửi thành công');
    setInviteEmail('');
    setShowInviteModal(false);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      toast.warning('Email này đã tham gia quỹ');
    } else {
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
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  if (!fund) return <p>Không có dữ liệu</p>;
  const { currentAmount, targetAmount, endDate } = fund || {};
  const today = new Date();
  const daysLeft = Math.ceil((new Date(endDate) - today) / (1000 * 60 * 60 * 24));
  const percentage = targetAmount ? (currentAmount / targetAmount) * 100 : 0;
  const progressBarClass = percentage >= 50 ? 'heets-gradient-success' : 'heets-gradient-warning';
  const isExpired = daysLeft < 0;
  if (!hasAccess) {
    return (
      <div className="text-center text-secondary">
        <h5>Bạn không có quyền truy cập vào quỹ tiết kiệm này.</h5>
        <img
    src='/images/sad.png'
    width="100"
    
  />
      </div>
    );
  }
  return (
    <div className="container">
      <nav aria-label="breadcrumb" style={{ marginBottom: "1rem" }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Chi tiết quỹ tiết kiệm
          </li>
          <li className="breadcrumb-item">
            <Link to="/savings-fund/list" className="text-dark">
              Danh sách quỹ tiết kiệm
            </Link>
          </li>
        </ol>
      </nav>
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="income-overview card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-items-center">
                  <tbody>
                    <tr>
                      <td className="text-center" style={{ width: '100px' }}>
                        <img
                          src={fund.categoryId && fund.categoryId.image ? fund.categoryId.image : '/images/overcast.png'}
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
                        <div className="progress-wrapper d-flex align-items-center mt-2">
                      {isOwner && (
                        <Link style={{ textDecoration: "none" }}  className="text-success" to={`/savings-fund/edit/${id}`}> 
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                        </Link>
                      )}
                        {isOwner && (
                        <div style={{ cursor: "pointer" }} className="text-danger ms-4" onClick={() => openConfirmationModal(fund)}>
                          <i 
                            className="bi bi-trash-fill"
                            
                          /> Xóa
                        </div>
                         )}
                         </div>
                        {isConfirmationModalOpen && (
                          <ConfirmationModal
                            isOpen={isConfirmationModalOpen}
                            onClose={closeConfirmationModal}
                            onConfirm={() => {
                              if (goalToDelete) handleDelete(goalToDelete._id);
                            }}
                            message={`Bạn có chắc chắn muốn xóa mục tiêu <span class="primary">${goalToDelete?.name}</span> ?`}
                          />
                        )}
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
                type="text"
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
