import prisma from '../utils/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (email, name, password) => {
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
      password: hashedPassword
    }
  });

  // Generate token
  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token
  };
};

export const loginUser = async (email, password) => {
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
