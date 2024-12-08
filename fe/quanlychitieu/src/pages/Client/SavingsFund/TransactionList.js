import React, { useEffect, useState } from 'react';
import { getFundTransactions } from '../../../service/SavingsFund';
const TransactionList = ({ fundId }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchTransactionsData = async () => {
            try {
                const transactionsData = await getFundTransactions(fundId);
                const sortedTransactions = transactionsData.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setTransactions(sortedTransactions);
              
            } catch (error) {
                setError('Error fetching transactions.');
            }
        };
        fetchTransactionsData();
    }, [fundId]);
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                <h6 className="mb-0 text-secondary">  Lịch sử nạp tiền</h6>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive" style={{ maxHeight: '22rem', overflowY: 'auto' }}>
                        <table className="table table-hover align-items-center">
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <th>
                                            <img
                                                src={transaction.userId?.avatar || '/images/sad.png'}
                                                width="40"
                                                height="40"
                                                alt="Thành viên"
                                                className="rounded-circle"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </th>
                                        <td>
                                            <h6 className="text-secondary mb-0">{transaction.userId?.name || "Người dùng không còn tồn tại"}</h6>
                                            <span className="text-muted small">{transaction.note} </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="text-secondary small">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </div>
                                            <h6 className="text-success mb-0">+{Number(transaction.amount).toLocaleString()} đ</h6>
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
export default TransactionList;
