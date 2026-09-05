/**
 * Authentication & Registration Validation Utilities
 * PRD Version 2.0 Compliance
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. user@company.com).';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return 'Phone number is required.';
  const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
  if (!phoneRegex.test(phone.trim())) {
    return 'Please enter a valid phone number (7–15 digits).';
  }
  return null;
};

export const validateEmployeeId = (empId) => {
  if (!empId || typeof empId !== 'string') return 'Employee ID is required.';
  if (empId.trim().length < 3) {
    return 'Employee ID must be at least 3 characters long.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one digit (0-9).';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*).';
  }
  return null;
};

export const validateMatchingPasswords = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};
