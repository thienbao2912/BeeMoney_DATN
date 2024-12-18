import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Cookies } from 'react-cookie';
import { useParams } from 'react-router-dom';

const EditGoalModal = ({ goal, onClose, onUpdate }) => {
    const [additionalAmount, setAdditionalAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    const formatCurrency = (value) => Number(value).toLocaleString('vi-VN');
    const unformatCurrency = (value) => value.replace(/[^\d]/g, '');

    const handleAmountChange = (e) => {
        const rawValue = unformatCurrency(e.target.value);
        setAdditionalAmount(rawValue);
    };

    const handleBlur = (e) => {
        e.target.value = formatCurrency(additionalAmount || 0);
    };

    const handleContribute = async () => {
        setLoading(true);
        const amountToAdd = parseFloat(additionalAmount);

        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            toast.warning('Vui lòng nhập số tiền');
            setLoading(false);
            return;
        }

        if (amountToAdd < 1000) {
            toast.warning('Số tiền ít nhất là 1,000 đồng');
            setLoading(false);
            return;
        }

        const transactionNote = note.trim() || null;

        try {
            const cookies = new Cookies();
            const token = cookies.get('token');
        
            const response = await fetch(`http://localhost:4000/api/savings-goals/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ amount: amountToAdd, note: transactionNote }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw { response: { status: response.status, data: errorData } };
            }

            onUpdate(amountToAdd, transactionNote);
            toast.success('Nạp tiền thành công');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleBackgroundClick = (e) => {
        if (e.target.className.includes('modal')) {
            onClose();
        }
    };

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleBackgroundClick}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Nạp tiền vào mục tiêu</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label htmlFor="additionalAmount" className="form-label">
                                Số tiền thêm vào
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="additionalAmount"
                                value={formatCurrency(additionalAmount)}
                                onChange={handleAmountChange}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="note" className="form-label">
                                Ghi chú
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Thêm ghi chú"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={loading}
                            onClick={handleContribute}
                        >
                            {loading ? 'Đang nạp...' : 'Nạp tiền'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGoalModal;
