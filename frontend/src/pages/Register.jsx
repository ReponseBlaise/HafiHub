import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/auth.css';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Email verification, 2: Code verification, 3: Complete registration
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Step 1: Send verification code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-verification', { email });
      setCodeSent(true);
      setStep(2);
      setResendCountdown(60);
      
      // Start countdown
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { 
        email, 
        code: verificationCode 
      });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!contact.trim()) {
      setError('Contact information is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email,
        name,
        password,
        contact
      });

      if (response.token) {
        // Store token
        localStorage.setItem('token', response.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    
    setLoading(true);
    try {
      await api.post('/auth/send-verification', { email });
      setResendCountdown(60);
      
      // Start countdown
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>HafiHub</h1>
        <h2>Create Account</h2>

        {/* Progress indicator */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Email</p>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Verify</p>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Register</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <p className="form-hint">We'll send a verification code to this email</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="verification-info">
              <p>We sent a 6-digit code to:</p>
              <p className="email-display">{email}</p>
              <button 
                type="button"
                className="change-email-btn"
                onClick={() => {
                  setStep(1);
                  setVerificationCode('');
                }}
              >
                Change email
              </button>
            </div>

            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength="6"
                required
              />
              <p className="form-hint">Enter the 6-digit code from your email</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                disabled={resendCountdown > 0 || loading}
                onClick={handleResendCode}
                className="resend-btn"
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Registration */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration}>
            <div className="verified-banner">
              <p>✓ Email verified successfully!</p>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact (Phone or WhatsApp)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+250 7XX XXX XXX"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
