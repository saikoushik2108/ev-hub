import mongoose from 'mongoose';
import { OWNER_VERIFICATION, SUBSCRIPTION_STATUS } from '../config/constants.js';

const ownerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(OWNER_VERIFICATION),
      default: OWNER_VERIFICATION.PENDING,
      index: true,
    },
    verificationDocuments: [
      {
        docType: { type: String, default: 'ID_PROOF' }, // ID_PROOF, ELECTRICITY_BILL, PROPERTY_TAX
        docUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rejectionReason: {
      type: String,
      default: '',
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.INACTIVE,
      index: true,
    },
    activeSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Hyderabad' },
      state: { type: String, default: 'Telangana' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    payoutDetailsReference: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' }, // Never store raw unencrypted in plain text
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingSettlement: {
      type: Number,
      default: 0,
    },
    settledAmount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema);
export default OwnerProfile;

