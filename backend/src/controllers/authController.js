import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OwnerProfile from '../models/OwnerProfile.js';
import { ROLES, USER_STATUS, OWNER_VERIFICATION, SUBSCRIPTION_STATUS } from '../config/constants.js';

/**
 * Register EV User
 * Note: Enforces USER role on the backend (does not trust public role input)
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, vehicleDetails } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash: password,
      role: ROLES.USER,
      status: USER_STATUS.ACTIVE,
      vehicleDetails: vehicleDetails || {},
    });

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to EV Hub.',
      token,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register Charging Point Owner
 * Note: Creates User with OWNER role and initialized OwnerProfile
 */
export const registerOwner = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, bankDetails } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash: password,
      role: ROLES.OWNER,
      status: USER_STATUS.ACTIVE,
    });

    // Create associated OwnerProfile
    const ownerProfile = await OwnerProfile.create({
      userId: user._id,
      verificationStatus: OWNER_VERIFICATION.PENDING,
      subscriptionStatus: SUBSCRIPTION_STATUS.INACTIVE,
      address: address || {
        city: 'Hyderabad',
        state: 'Telangana',
      },
      payoutDetailsReference: bankDetails
        ? {
            bankName: bankDetails.bankName || '',
            accountHolderName: bankDetails.accountHolderName || name,
            accountNumberMasked: bankDetails.accountNumber
              ? `XXXX-XXXX-${bankDetails.accountNumber.slice(-4)}`
              : '',
            ifscCode: bankDetails.ifscCode || '',
            upiId: bankDetails.upiId || '',
          }
        : {},
    });

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Host registration received! Your account is submitted for verification.',
      token,
      refreshToken,
      user,
      ownerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash +refreshToken'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.',
      });
    }

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Fetch owner profile if applicable
    let ownerProfile = null;
    if (user.role === ROLES.OWNER) {
      ownerProfile = await OwnerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      refreshToken,
      user,
      ownerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT Token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'evhub_jwt_refresh_secret_key_change_in_production_2026!'
    );

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or revoked refresh token.',
      });
    }

    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.',
    });
  }
};

/**
 * Get current authenticated user details
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let ownerProfile = null;
    if (user.role === ROLES.OWNER) {
      ownerProfile = await OwnerProfile.findOne({ userId: user._id }).populate(
        'activeSubscriptionId'
      );
    }

    res.status(200).json({
      success: true,
      user,
      ownerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage, vehicleDetails } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (vehicleDetails) {
      user.vehicleDetails = {
        ...user.vehicleDetails,
        ...vehicleDetails,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return success even if not found to avoid user enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In dev / test fallback, log token or return in dev response
    console.log(`[Auth] Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully.',
      // Provided in development to allow immediate testing without an external SMTP server
      demoResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.passwordHash = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

