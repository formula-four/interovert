function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validateSignup(req, res, next) {
  const { name, email, password, phoneNumber, address } = req.body || {};
  if (!name || !email || !password || !phoneNumber) {
    return res.status(400).json({
      message: 'Missing required fields',
      required: ['name', 'email', 'password', 'phoneNumber'],
    });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  const line1 = String(address?.line1 || '').trim();
  const city = String(address?.city || '').trim();
  if (!line1 || !city) {
    return res.status(400).json({
      message: 'Address is required: provide address line 1 and city',
    });
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, phoneNumber } = req.body || {};
  if (!email || !String(email).trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!phoneNumber || !String(phoneNumber).trim()) {
    return res.status(400).json({ message: 'Phone number is required' });
  }
  next();
}

export function validateVerifyOtp(req, res, next) {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
  next();
}

export function validateForgotPassword(req, res, next) {
  const { email } = req.body || {};
  if (!email || !isEmail(email)) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  next();
}

export function validateResetPassword(req, res, next) {
  const { email, token, password } = req.body || {};
  if (!email || !isEmail(email)) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  if (!token || String(token).length < 10) {
    return res.status(400).json({ message: 'Reset token is missing or invalid' });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  next();
}
