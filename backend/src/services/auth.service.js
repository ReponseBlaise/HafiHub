import prisma from '../utils/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (email, name, password, contact) => {
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate required fields
  if (!contact || contact.trim() === '') {
    throw new Error('Contact information is required');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      contact: contact.trim()
    }
  });

  // Generate token
  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    contact: user.contact,
    token
  };
};

export const loginUser = async (email, password) => {
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format');
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Generate token
  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token
  };
};
