const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const loginSuccessService = async (id, tokenLogin) => {
  try {
    const newTokenLogin = uuidv4();


    let user = await User.findOne({ _id: id, tokenLogin });

    if (!user) {
      return {
        err: 1,
        msg: 'User not found or invalid token'
      };
    }


    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name,avatar: user.avatar },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '5d' }
    );


    await User.updateOne({ _id: id }, { tokenLogin: newTokenLogin });


    return {
      err: 0,
      msg: 'OK',
      token
    };

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error in loginSuccess service:', error);
    throw new Error('Failed to process login: ' + error.message);
  }
};

module.exports = {
  loginSuccessService
};
