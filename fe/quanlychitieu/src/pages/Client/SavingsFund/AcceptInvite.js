import React, { useState } from 'react';
import axios from 'axios';
import { Cookies } from 'react-cookie';

const AcceptInvite = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const cookies = new Cookies();
    const token = cookies.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:4000/api/accept-invite',
                { code },
                {
                    headers: {
                        'x-auth-token': token,
                    },
                }
            );
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error response:', error.response);
            setMessage('Mã xác nhận không hợp lệ');
        }
    };

    return (
        <div className=''>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        value={code}
                        className='form-control'
                        onChange={(e) => setCode(e.target.value)}
                        required
                    /> <button className='btn btn-primary mt-2' type="submit">Gửi mã xác nhận</button>
                </div>
               
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AcceptInvite;
