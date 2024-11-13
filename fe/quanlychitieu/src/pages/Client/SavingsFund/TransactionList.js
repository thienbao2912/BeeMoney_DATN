import React, { useEffect, useState } from 'react';
import { getFundTransactions } from '../../../service/SavingsFund';


const TransactionList = ({ fundId }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactionsData = async () => {
            try {
                const transactionsData = await getFundTransactions(fundId);
                setTransactions(transactionsData);
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
        <div className="col-md-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-secondary">  Lịch sử nạp tiền</h6>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-items-center">
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <th>
                                            <div className="circle mb-2">
                                                <img
                                                    src={transaction.userId?.avatar || '/images/chicken.png'}
                                                    width="40px"

                                                    className="rounded-circle"
                                                />
                                            </div>
                                        </th>
                                        <td>
                                            <h6 className="primary mb-0">{transaction.userId?.name || "Người nạp"}</h6>
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
