import React from 'react';

const ConfirmDeleteModal = ({ show, onClose, onConfirm, categoryName, name, errorMessage }) => {
    if (!show) return null;

    return (
        <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Xác nhận xóa</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        {categoryName && (
                            <p>Bạn có chắc chắn muốn xóa danh mục <strong>{categoryName}</strong> không?</p>
                        )}
                        {name && (
                            <p>Bạn có chắc chắn muốn xóa người dùng <strong>{name}</strong> không?</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
