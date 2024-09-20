import React, { useState } from 'react';
import { updateSavingGoalAmount } from '../../../../service/SavingGoal';

const EditGoalModal = ({ goal, onClose, onUpdate }) => {
    const [additionalAmount, setAdditionalAmount] = useState('');
    const [error, setError] = useState(null);

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
            setAdditionalAmount(value);
            e.target.value = formatCurrency(value);
        }
    };

    const handleUpdate = async () => {
        try {
            const newCurrentAmount = parseFloat(goal.currentAmount) + parseFloat(additionalAmount);
            await updateSavingGoalAmount(goal._id, { currentAmount: newCurrentAmount });
            onUpdate();
            onClose();
        } catch (error) {
            setError('Lỗi nạp tiền ' + error.message);
        }
    };

    return (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Nạp tiền vào mục tiêu</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <label htmlFor="additionalAmount" className="form-label">Số tiền thêm vào</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="additionalAmount" 
                                value={formatCurrency(additionalAmount)} 
                                onChange={handleAmountChange} 
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
                        <button type="button" className="btn btn-primary" onClick={handleUpdate}>Lưu thay đổi</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGoalModal;
