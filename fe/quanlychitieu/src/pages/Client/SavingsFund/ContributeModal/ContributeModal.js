import React, { useEffect, useState } from 'react';
import { getCategories, getSavingsFundById, contributeToFund } from '../../../../service/SavingFund';
import { useParams, useNavigate, Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap Modal

const FundDetail = () => {
  const [fund, setFund] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryImage, setCategoryImage] = useState(''); // State to hold the category image URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState(''); // State for the email input
  const [emailError, setEmailError] = useState(null); // State for email errors
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [contributionAmount, setContributionAmount] = useState(''); // State for contribution amount
  const [note, setNote] = useState(''); // State for contribution note
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFund = async () => {
      try {
        const fundData = await getSavingsFundById(id);
        setFund(fundData);

        // Find the category of the fund
        const category = categories.find(cat => cat._id === fundData.categoryId);
        if (category) {
          setCategoryImage(category.image); // Set the image URL
        }
      } catch (error) {
        console.error('Error fetching fund details:', error);
        setError('Error fetching fund details');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const expenseCategories = data.filter(category => category.type === 'expense');
        setCategories(expenseCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories(); // Fetch categories first
    fetchFund(); // Fetch fund details after categories are fetched
  }, [id, categories]);

  const handleClose = () => {
    navigate('/savings-fund/list'); // Go back to the list page
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    emailjs.send('phuongthu.2727@gmail.com', 'YOUR_TEMPLATE_ID', { to_email: email, fundName: fund.name })
      .then(() => {
        setSuccess('Invitation sent successfully!');
        setEmail(''); // Clear the input field
        setEmailError(null);
      })
      .catch(() => {
        setError('Failed to send invitation.');
        setEmailError(null);
      });
  };

  const handleShowModal = () => setShowModal(true); // Show the modal
  const handleCloseModal = () => setShowModal(false); // Hide the modal

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contributionAmount || isNaN(contributionAmount) || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      await contributeToFund(id, { amount: contributionAmount, note });
      setSuccess('Contribution successful!');
      setShowModal(false); // Hide the modal after contribution
      setFund(prev => ({
        ...prev,
        currentAmount: prev.currentAmount + parseFloat(contributionAmount),
        transactions: [
          ...prev.transactions,
          { participantId: id, amount: contributionAmount, note, date: new Date() }
        ]
      })); // Update currentAmount and transaction history
    } catch (error) {
      setError('Error contributing to fund');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (success) return <p className="text-success">{success}</p>;
  if (!fund) return <p>No fund data available</p>;

  const { currentAmount, targetAmount, endDate } = fund;
  const today = new Date();
  const daysLeft = Math.ceil((new Date(endDate) - today) / (1000 * 60 * 60 * 24));
  const percentage = (currentAmount / targetAmount) * 100;
  const progressBarClass = percentage >= 100 ? 'bg-success' : 'bg-warning';

  return (
    <div className="container">
      {/* Fund Details */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="income-overview card">
            <div className="card-body">
              {/* Category Image */}
              <div className="category-target d-flex align-items-center mb-3">
                <img
                  src={categoryImage}
                  alt="Category"
                  width="50"
                  height="50"
                  className="rounded"
                />
              </div>
              {/* Fund Date and Progress */}
              {/* ... */}
            </div>
          </div>
        </div>

        {/* Contribution Modal */}
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <Button variant="warning" onClick={handleShowModal}>
                Nạp tiền
              </Button>
            </div>
          </div>
        </div>

        {/* Modal for contributing */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Nạp tiền vào quỹ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleContribute}>
              <div className="form-group">
                <label htmlFor="contributionAmount">Số tiền</label>
                <input
                  type="number"
                  className="form-control"
                  id="contributionAmount"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="note">Ghi chú</label>
                <input
                  type="text"
                  className="form-control"
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              {success && <p className="text-success">{success}</p>}
              <Button variant="primary" type="submit">
                Nạp tiền
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default FundDetail;
