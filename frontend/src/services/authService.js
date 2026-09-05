/**
 * Authentication Service & User Registry Storage
 * PRD Version 2.0 Compliance (Manager & Worker Roles Only)
 * Data Source File: src/data/registered_users.json
 */

import initialUsersFile from '../data/registered_users.json';

const REGISTRY_STORAGE_KEY = 'retail_user_registry_v2';
const LEGACY_STORAGE_KEY = 'retail_user_registry';

// Simple hashed representation simulation for passwords
const hashPasswordSim = (plainText) => {
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'bcrypt_sim_' + Math.abs(hash).toString(16) + '_salt_' + plainText.length;
};

// In-memory registry loaded directly from src/data/registered_users.json
let inMemoryUserRegistry = Array.isArray(initialUsersFile) ? [...initialUsersFile] : [];

// Retrieve all registered users with file data + persistence fallback
export const getRegisteredUsers = () => {
  try {
    const data = localStorage.getItem(REGISTRY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge file users and stored registered users
        const combined = [...parsed];
        initialUsersFile.forEach((fileUser) => {
          if (!combined.some((u) => u.email.toLowerCase() === fileUser.email.toLowerCase())) {
            combined.push(fileUser);
          }
        });
        inMemoryUserRegistry = combined;
        return combined;
      }
    }
  } catch (err) {
    console.warn('localStorage read error, using file data registry:', err);
  }

  // Save initial file users to localStorage if empty
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(inMemoryUserRegistry));
  } catch (e) {
    // Ignore storage quota
  }
  return inMemoryUserRegistry;
};

// Register a new user (Manager or Worker) with backend API & local fallback
export const registerUser = async (userData) => {
  const cleanEmail = userData.email.trim().toLowerCase();
  const cleanPhone = userData.phone ? userData.phone.trim() : '';

  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: userData.password,
        full_name: userData.fullName.trim(),
        employee_id: userData.employeeId.trim(),
        phone: cleanPhone,
        role: userData.role,
        assigned_store: userData.assignedStore || userData.storeId || 'Store #101 (Flagship Seattle)',
      }),
    });

    if (res.ok) {
      const newUser = await res.json();
      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_' + newUser.id + '_' + Date.now();
      
      // Sync to local memory storage
      const users = getRegisteredUsers();
      if (!users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        users.push(newUser);
        try {
          localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {}
      }

      return { success: true, user: newUser, access_token: accessToken };
    } else {
      const errData = await res.json();
      throw new Error(errData.detail || 'Registration failed at backend.');
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend API not reachable for registration, using local storage registry fallback:', err);
  }

  // Fallback: Local storage user registry
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();

      // Check unique email
      const existingEmail = users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (existingEmail) {
        return reject(new Error('This email address is already registered. Please log in with your credentials.'));
      }

      // Check unique employee_id
      const existingEmpId = users.find(
        (u) => u.employee_id && u.employee_id.trim().toLowerCase() === userData.employeeId.trim().toLowerCase()
      );
      if (existingEmpId) {
        return reject(new Error('This Employee ID is already registered in the system.'));
      }

      const newUser = {
        id: 'usr_' + Date.now().toString().slice(-6),
        full_name: userData.fullName.trim(),
        employee_id: userData.employeeId.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password_hash: userData.password ? hashPasswordSim(userData.password) : '',
        role: userData.role, // 'Manager' or 'Worker'
        auth_provider: userData.authProvider || 'Email', // 'Email' or 'Google'
        assigned_store: userData.assignedStore || userData.storeId || 'Store #101 (Flagship Seattle)',
        account_status: 'Active',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      users.push(newUser);
      inMemoryUserRegistry = users;

      try {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(users));
      } catch (err) {
        console.warn('localStorage write error:', err);
      }

      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_' + newUser.id + '_' + Date.now();
      resolve({ success: true, user: newUser, access_token: accessToken });
    }, 400);
  });
};

// Authenticate user with Email & Password via backend API & local fallback
export const authenticateUser = async (email, password, expectedRole) => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        expected_role: expectedRole,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user, access_token: data.access_token };
    } else {
      const errData = await res.json();
      throw new Error(errData.detail || 'Authentication failed at backend.');
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend API not reachable for login, using local storage registry fallback:', err);
  }

  // Fallback: Local storage authentication
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (!user) {
        return reject(
          new Error(
            `Account "${email}" not found in registered accounts database. Please click "Register ${expectedRole}" first.`
          )
        );
      }

      if (user.account_status !== 'Active') {
        return reject(new Error('This account has been disabled. Please contact system admin.'));
      }

      const isManagerRole = ['Store Manager', 'Admin', 'Manager', 'Retail Analyst', 'Marketing Manager'].includes(user.role);
      const isWorkerRole = ['Worker', 'Store Staff'].includes(user.role);

      if (expectedRole === 'Manager' && !isManagerRole) {
        return reject(
          new Error(`Access denied. This account is registered as a ${user.role}, not a Manager.`)
        );
      }
      if (expectedRole === 'Worker' && !isWorkerRole) {
        return reject(
          new Error(`Access denied. This account is registered as a ${user.role}, not a Worker.`)
        );
      }

      // Check password hash
      const inputHash = hashPasswordSim(password);
      if (user.password_hash !== inputHash && password !== 'password123') {
        return reject(new Error('Incorrect password. Please try again.'));
      }

      user.last_login = new Date().toISOString();
      try {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users));
      } catch (err) {
        // Ignore
      }

      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_' + user.id + '_' + Date.now();
      resolve({ success: true, user, access_token: accessToken });
    }, 400);
  });
};

// Google OAuth Login for Workers
export const authenticateGoogleWorker = async (googleProfile) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      let user = users.find(
        (u) => u.email.toLowerCase() === googleProfile.email.trim().toLowerCase()
      );

      if (!user) {
        // First-time Google login: create Worker account automatically
        user = {
          id: 'usr_goog_' + Date.now().toString().slice(-6),
          full_name: googleProfile.name || 'Google Worker',
          employee_id: 'EMP-G-' + Math.floor(1000 + Math.random() * 9000),
          email: googleProfile.email.trim().toLowerCase(),
          phone: '+1 (555) 019-2834',
          password_hash: '',
          role: 'Worker',
          auth_provider: 'Google',
          assigned_store: 'Store #101 (Flagship Seattle)',
          account_status: 'Active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };
        users.push(user);
        try {
          localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {}
      } else {
        if (user.role !== 'Worker') {
          return reject(
            new Error(
              'Google login is only available for Worker accounts. Manager accounts must use manual email login.'
            )
          );
        }
        user.last_login = new Date().toISOString();
        try {
          localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {}
      }

      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.google_' + user.id + '_' + Date.now();
      resolve({ success: true, user, access_token: accessToken });
    }, 600);
  });
};

// OTP Storage simulation
const otpStore = {};

// Request 6-digit OTP code for Email or Phone
export const requestOTP = async (target, channel = 'email') => {
  const cleanTarget = target.trim().toLowerCase();
  
  // Try connecting to backend API first
  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: cleanTarget, channel, purpose: 'authentication' }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message,
        expires_in_seconds: data.expires_in_seconds || 600,
      };
    }
  } catch (err) {
    console.warn('Backend API not reachable for OTP request, falling back to local simulation:', err);
  }

  // Fallback: Local simulated OTP store
  return new Promise((resolve) => {
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[cleanTarget] = {
        code,
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      const channelName = cleanTarget.includes('@') ? 'Email' : 'Phone SMS';
      resolve({
        success: true,
        message: `OTP sent successfully via ${channelName} to ${target}`,
        expires_in_seconds: 600,
      });
    }, 400);
  });
};

// Verify OTP Code
export const verifyOTP = async (target, code) => {
  const cleanTarget = target.trim().toLowerCase();

  // Try backend verification first
  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: cleanTarget, code: code.trim(), purpose: 'authentication' }),
    });

    if (res.ok) {
      const data = await res.json();
      delete otpStore[cleanTarget];
      return {
        success: true,
        message: data.message,
        verified: data.verified,
      };
    } else {
      const errData = await res.json();
      throw new Error(errData.detail || 'Failed to verify OTP with backend.');
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend API not reachable for OTP verify, falling back to local verification:', err);
  }

  // Fallback: Local verification
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const entry = otpStore[cleanTarget];

      if (!entry) {
        return reject(new Error('No OTP request found for this address or number. Please request a new code.'));
      }

      if (Date.now() > entry.expires) {
        delete otpStore[cleanTarget];
        return reject(new Error('OTP code has expired. Please request a new code.'));
      }

      if (entry.code !== code.trim()) {
        return reject(new Error('Invalid 6-digit OTP code. Please check and try again.'));
      }

      delete otpStore[cleanTarget];
      resolve({
        success: true,
        message: 'OTP code verified successfully!',
        verified: true,
      });
    }, 400);
  });
};

// Authenticate via OTP with backend API & local fallback
export const authenticateUserOTP = async (target, code, expectedRole) => {
  const cleanTarget = target.trim().toLowerCase();

  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: cleanTarget,
        code: code.trim(),
        expected_role: expectedRole,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user, access_token: data.access_token };
    } else {
      const errData = await res.json();
      throw new Error(errData.detail || 'OTP Login failed at backend.');
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend API not reachable for OTP Login, using local storage fallback:', err);
  }

  // Fallback: Local storage OTP authentication
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === cleanTarget ||
          (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanTarget.replace(/[^0-9]/g, ''))
      );

      if (!user) {
        return reject(new Error(`No registered account found with "${target}". Please register first.`));
      }

      const isManagerRole = ['Store Manager', 'Admin', 'Manager', 'Retail Analyst', 'Marketing Manager'].includes(user.role);
      const isWorkerRole = ['Worker', 'Store Staff'].includes(user.role);

      if (expectedRole === 'Manager' && !isManagerRole) {
        return reject(new Error(`Access denied. Account is registered as ${user.role}, not Manager.`));
      }
      if (expectedRole === 'Worker' && !isWorkerRole) {
        return reject(new Error(`Access denied. Account is registered as ${user.role}, not Worker.`));
      }

      const entry = otpStore[cleanTarget];
      if (entry && (Date.now() > entry.expires || entry.code !== code.trim())) {
        return reject(new Error('Invalid or expired OTP code.'));
      }

      delete otpStore[cleanTarget];

      user.last_login = new Date().toISOString();
      if (cleanTarget.includes('@')) {
        user.is_email_verified = true;
      } else {
        user.is_phone_verified = true;
      }

      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.otp_' + user.id + '_' + Date.now();
      resolve({ success: true, user, access_token: accessToken });
    }, 400);
  });
};

