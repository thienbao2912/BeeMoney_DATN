import React, { useEffect, useState } from 'react';
import { getFundMembers } from '../../../service/SavingsFund';
const MemberList = ({ fundId }) => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const fetchMembersData = async () => {
        try {
            const membersData = await getFundMembers(fundId);
            setMembers(membersData);
        } catch (error) {
            setError('Error fetching members.');
        }
    };
    useEffect(() => {
        fetchMembersData();
    }, [fundId]); 
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                <h6 className="mb-0 text-secondary">
                    <i className="fa fa-user me-2"></i>Thành viên
                </h6>
            </div>
            <div className="card shadow">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-items-center">
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member._id}>
                                        <th>
                                            <div className="d-flex flex-column align-items-center">
                                                <img
                                                    src={member.userId?.avatar || '/images/chicken.png'}
                                                    width="40"
                                                    height="40"
                                                    alt="Thành viên"
                                                    className="rounded-circle"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        </th>
                                        <td>
                                            <h6 className="primary mb-0">{member.userId.name}</h6>
                                            <span className="text-muted small">{member.userId.email}</span>
                                        </td>
                                        <td className="col-4">
                                            <div>
                                                <h6 className="text-success">
                                                    {Number(member.contribution).toLocaleString()} đ
                                                </h6>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MemberList;
