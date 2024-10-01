import React, { useEffect, useState } from 'react';
import { getFundMembers } from '../../../service/SavingFund';
// import '../SavingsFund/DetailPage/DetailPage.css'



const MemberList = ({ fundId, currentAmount }) => {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembersData = async () => {
            try {
                const membersData = await getFundMembers(fundId);
                setMembers(membersData);
            } catch (error) {
                setError('Error fetching members.');
            }
        };

        fetchMembersData();
    }, [fundId]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="col-md-7">
             <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 text-secondary">  <i className="fa fa-user me-2"></i>Thành viên</h6>
          
          </div>
            {/* <div className="text-left text-primary mb-3">
                <i className="fa fa-user me-2"></i> Thành viên
            </div> */}
            <div className="card shadow">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-items-center">
                            <tbody>
                                {members.map((member) => {
                                    // Tính phần trăm đóng góp của thành viên
                                    const contributionPercentage = currentAmount > 0
                                        ? ((member.contribution / currentAmount) * 100).toFixed(0)
                                        : 0;

                                    return (
                                        <tr key={member._id}>
                                            <th className="">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="circle mb-2">
                                                        <img
                                                            src={member.userId?.avatar || '/images/chicken.png'}
                                                            width="40px"
                                                            alt={member.userId.name || "Thành viên"}
                                                            className="rounded-circle"
                                                        />
                                                    </div>
                                                </div>
                                            </th>
                                            <td>
                                                <h6 className="primary mb-0">{member.userId.name}</h6>
                                                <span className="text-muted small">{member.userId.email}</span>
                                            </td>
                                            <td className='col-4'>
                                                <div className="">
                                                    <h6 className="text-success">{Number(member.contribution).toLocaleString()}  đ</h6>
                                                </div>
                                                <div className="progress-wrapper d-flex align-items-center mt-2">
                                                <span className="text-muted small me-2">{Math.floor(contributionPercentage)}%</span>
                                                    <div className="progress flex-grow-1">
                                                        <div
                                                            className="progress-bar heets-gradient-danger"
                                                            role="progressbar"
                                                            style={{ width: `${contributionPercentage}%` }}
                                                            aria-valuenow={contributionPercentage}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        >
                                                         
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberList;
