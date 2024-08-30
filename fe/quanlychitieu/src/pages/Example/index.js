import React, { useEffect, useState } from 'react';
import TransactionService from '../../service/Transaction';

const ExampleComponent = () => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await TransactionService.getAllTransactions();
                setTransactions(data.data);
            } catch (error) {
                setError('Error fetching transactions');
                console.error(error);
            }
        };

        fetchTransactions();
    }, []);

    const handleCreateTransaction = async (transactionData) => {
        try {
            const newTransaction = await TransactionService.createTransaction(transactionData);
            setTransactions([...transactions, newTransaction.data]);
        } catch (error) {
            setError('Error creating transaction');
            console.error(error);
        }
    };

    const handleUpdateTransaction = async (id, transactionData) => {
        try {
            const updatedTransaction = await TransactionService.updateTransaction(id, transactionData);
            setTransactions(transactions.map(transaction => 
                transaction._id === id ? updatedTransaction.data : transaction
            ));
        } catch (error) {
            setError('Error updating transaction');
            console.error(error);
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await TransactionService.deleteTransaction(id);
            setTransactions(transactions.filter(transaction => transaction._id !== id));
        } catch (error) {
            setError('Error deleting transaction');
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Transactions</h1>
            {error && <p>{error}</p>}
            <ul>
                {transactions.map(transaction => (
                    <li key={transaction._id}>
                        {transaction.description} - ${transaction.amount}
                        <button onClick={() => handleDeleteTransaction(transaction._id)}>Delete</button>
                    </li>
                ))}
            </ul>
            {/* Add forms or other components for creating and updating transactions */}
        </div>
    );
};

export default ExampleComponent;
