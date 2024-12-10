import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal show"
            tabIndex="-1"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                style={{
                    maxWidth: '600px',
                    width: '90%',
                }}
            >
                <div className="modal-content text-center p-4">
                    {/* Header Icon */}
                    <div>
                        <i
                            className="bi bi-exclamation-circle"
                            style={{ fontSize: '5rem', color: '#FF6B6B' }}
                        ></i>
                    </div>
                    {/* Message */}
                    <div className="modal-body">
                        <p
                            dangerouslySetInnerHTML={{ __html: message }}
                            style={{
                                fontSize: '18px',
                                fontWeight: '500',
                                margin: '0',
                            }}
                        ></p>
                        <p style={{ fontSize: '14px', color: 'gray' }}>
                            Bạn sẽ không thể khôi phục dữ liệu sau khi đã xóa!
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-footer d-flex justify-content-center gap-3">
                    <button
                            type="button"
                            className="btn btn-danger px-4"
                            onClick={onConfirm}
                        >
                            Chấp nhận
                        </button>
                        <button
                            type="button"
                            className="btn btn-light px-4"
                            onClick={onClose}
                        >
                            Không
                        </button>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
