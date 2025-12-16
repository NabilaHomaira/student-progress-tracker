// controllers/userController.js
const User = require('../models/User');

// Get all users (with optional role filter)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('name email role').sort('name');

    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};

