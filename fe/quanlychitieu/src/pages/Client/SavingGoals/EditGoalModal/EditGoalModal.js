import React, { useState } from 'react';
import { addTransaction } from '../../../../service/SavingGoal';
import { toast } from 'react-toastify';
const EditGoalModal = ({ goal, onClose, onUpdate }) => {
    const [additionalAmount, setAdditionalAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
 

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
    
    
        const transactionNote = note || null;
        try {
            const response = await addTransaction(goal._id, { amount: amountToAdd, note: transactionNote });
            onUpdate(amountToAdd, transactionNote);
            onClose();
            toast.success('Nạp tiền thành công')
    
        } catch (error) {
            if (error.status === 400) {
                toast.warning(error.message);   
            } else {
                toast.error('Lỗi nạp tiền: ' + (error.message || 'Unknown error')); 
            }
        } finally {
            setLoading(false);  
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
                        <div className="mb-3">
                            <label htmlFor="note" className="form-label">Ghi chú</label>
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
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
                        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleUpdate}> 
                            {loading ? 'Đang nạp...' : 'Nạp tiền'}
                             </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGoalModal;
