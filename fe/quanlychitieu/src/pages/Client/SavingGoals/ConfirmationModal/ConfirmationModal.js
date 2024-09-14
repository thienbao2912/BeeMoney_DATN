import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                    <p dangerouslySetInnerHTML={{ __html: message }}></p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy bỏ</button>
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
