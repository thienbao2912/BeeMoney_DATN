import React from 'react';

const NotificationList = ({ notifications }) => {
    return (
        <div className="notification-list">
            <div className="widget-media dz-scroll" style={{
                width: "250px",
                maxHeight: "300px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #f1f1f1",
            }}>
                <h6 style={{ marginLeft: '10px' }}>Thông báo</h6>
                <hr style={{ marginTop: '5px' }}></hr>
                <ul className="timeline" style={{ listStyle: "none", padding: 0 }}>
                    {notifications && notifications.length > 0 ? (
                        notifications.map(notification => (
                            notification && notification.content ? (
                                <li style={{ marginTop: "10px" }} key={notification._id}>
                                    <div className="timeline-panel d-flex align-items-center">
                                        <div style={{ marginLeft: "10px" }} className="media-body">
                                            <h6 className="mb-1" style={{ fontSize: "14px" }}>
                                                {notification.content}
                                            </h6>
                                            <small style={{ fontSize: "12px" }}>
                                                {new Intl.DateTimeFormat('vi-VN').format(new Date(notification.createdAt))}
                                            </small>
                                        </div>
                                    </div>
                                </li>
                            ) : null
                        ))
                    ) : (
                        <li style={{ marginTop: "10px" }}>
                            <div className="timeline-panel">
                                <div style={{ marginLeft: "10px" }} className="media-body">
                                    <h6 className="mb-1" style={{ fontSize: "14px", textAlign: "center" }}>
                                        Chưa có thông báo
                                    </h6>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NotificationList;
