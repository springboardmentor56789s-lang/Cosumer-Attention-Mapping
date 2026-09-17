/**
 * Dedicated OTP Dispatch & Verification Service for Frontend Application
 * Handles Email and Phone Number OTP dispatches, API integration, and local fallback simulation.
 */

import { requestOTP, verifyOTP, authenticateUserOTP } from './authService';

const API_BASE_URL = 'http://localhost:8000/api/v1/auth';

/**
 * Dispatch 6-digit OTP code to an Email address.
 * @param {string} email - Recipient email address
 * @param {string} [purpose='authentication'] - Purpose of OTP
 * @returns {Promise<{success: boolean, message: string, demo_otp?: string, expires_in_seconds: number}>}
 */
export const sendEmailOTP = async (email, purpose = 'authentication') => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address (e.g. user@store.com).');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: cleanEmail, channel: 'email', purpose }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        channel: 'email',
        target: cleanEmail,
        message: data.message,
        expires_in_seconds: data.expires_in_seconds || 600,
      };
    }
  } catch (err) {
    console.warn('Backend API unreachable for Email OTP send, falling back to local service:', err);
  }

  // Local fallback
  return requestOTP(cleanEmail, 'email');
};

/**
 * Dispatch 6-digit OTP code to a Phone number.
 * @param {string} phone - Recipient phone number (e.g. +15550192834)
 * @param {string} [purpose='authentication'] - Purpose of OTP
 * @returns {Promise<{success: boolean, message: string, demo_otp?: string, expires_in_seconds: number}>}
 */
export const sendPhoneOTP = async (phone, purpose = 'authentication') => {
  const cleanPhone = phone.trim();
  const digitsOnly = cleanPhone.replace(/[^\d]/g, '');
  if (!cleanPhone || digitsOnly.length < 7) {
    throw new Error('Please enter a valid phone number with area code.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: cleanPhone, channel: 'sms', purpose }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        channel: 'sms',
        target: cleanPhone,
        message: data.message,
        expires_in_seconds: data.expires_in_seconds || 600,
      };
    }
  } catch (err) {
    console.warn('Backend API unreachable for Phone SMS OTP send, falling back to local service:', err);
  }

  // Local fallback
  return requestOTP(cleanPhone, 'sms');
};

/**
 * Verify OTP code for Email or Phone number.
 * @param {string} target - Email or Phone number
 * @param {string} code - 6-digit verification code
 * @param {string} [purpose='authentication'] - Purpose
 */
export const verifyOTPCode = async (target, code, purpose = 'authentication') => {
  return verifyOTP(target, code);
};

/**
 * Authenticate/Log in using OTP code for Email or Phone number.
 * @param {string} target - Email or Phone number
 * @param {string} code - 6-digit OTP code
 * @param {string} [expectedRole] - Expected user role ('Manager' or 'Worker')
 */
export const loginWithOTPCode = async (target, code, expectedRole) => {
  return authenticateUserOTP(target, code, expectedRole);
};
