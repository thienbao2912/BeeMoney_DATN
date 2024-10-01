import axios from 'axios';
import { useState } from 'react';
import { Cookies } from 'react-cookie';

const SendInvite = () => {
  const [email, setEmail] = useState('');
  const [fundId, setFundId] = useState('');
  const cookies = new Cookies();
  const token = cookies.get('token'); // Read token from cookies

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission

    try {
      const response = await axios.post(
        'http://localhost:4000/api/send-invite-code',
        { email, fundId },
        {
          headers: {
            'x-auth-token': token, // Send token as x-auth-token
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error('Error sending invite:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Fund ID:
        <input
          type="text"
          value={fundId}
          onChange={(e) => setFundId(e.target.value)}
          required
        />
      </label>
      <button type="submit">Send Invite</button>
    </form>
  );
};

export default SendInvite;
