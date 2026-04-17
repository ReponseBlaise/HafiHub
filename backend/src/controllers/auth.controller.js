import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.registerUser(email, name, password);
    const { token, ...userData } = result;
    res.status(201).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.loginUser(email, password);
    const { token, ...userData } = result;
    res.status(200).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
