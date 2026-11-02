import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import OwnerProfile from '../models/OwnerProfile.js';
import ChargingStation from '../models/ChargingStation.js';
import Booking from '../models/Booking.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

import {
  ROLES,
  USER_STATUS,
  OWNER_VERIFICATION,
  STATION_APPROVAL,
  SUBSCRIPTION_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SETTLEMENT_STATUS,
  DEFAULT_PLANS,
} from '../config/constants.js';
import { connectDB, closeDB } from '../config/db.js';

export const seedDatabase = async () => {
  console.log('[Seed] Starting database population with realistic demo data...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    OwnerProfile.deleteMany({}),
    ChargingStation.deleteMany({}),
    Booking.deleteMany({}),
    Subscription.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Review.deleteMany({}),
    Transaction.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing records.');

  // 1. Create Subscription Plans
  const plans = await SubscriptionPlan.insertMany(DEFAULT_PLANS);
  console.log(`[Seed] Created ${plans.length} subscription plans.`);

  const basicPlan = plans.find((p) => p.code === 'BASIC');
  const proPlan = plans.find((p) => p.code === 'PRO');
  const businessPlan = plans.find((p) => p.code === 'BUSINESS');

  // 2. Create Platform Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@evhub.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const admin = await User.create({
    name: 'EV Hub Administrator',
    email: adminEmail.toLowerCase(),
    phone: '+91 98765 00001',
    passwordHash: adminPassword,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });
  console.log(`[Seed] Admin created: ${admin.email}`);

  // 3. Create 3 Sample Verified Hosts (Charging Point Owners)
  const defaultPassword = 'Password@123';

  // Host 1: Rajesh Kumar (Pro Host - Gachibowli)
  const rajeshUser = await User.create({
    name: 'Rajesh Kumar',
    email: 'rajesh.host@evhub.com',
    phone: '+91 98765 11001',
    passwordHash: defaultPassword,
    role: ROLES.OWNER,
    status: USER_STATUS.ACTIVE,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  });

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setDate(nextMonth.getDate() + 30);

  const rajeshSub = await Subscription.create({
    ownerId: rajeshUser._id,
    planId: proPlan._id,
    razorpaySubscriptionId: 'sub_demo_rajesh_pro',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: now,
    endDate: nextMonth,
    nextBillingDate: nextMonth,
    amount: proPlan.price,
  });

  const rajeshProfile = await OwnerProfile.create({
    userId: rajeshUser._id,
    verificationStatus: OWNER_VERIFICATION.VERIFIED,
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    activeSubscriptionId: rajeshSub._id,
    address: {
      street: 'Plot 42, Telecom Nagar, Gachibowli',
      area: 'Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      landmark: 'Near DLF Cyber City',
    },
    payoutDetailsReference: {
      accountHolderName: 'Rajesh Kumar',
      bankName: 'HDFC Bank',
      accountNumberMasked: 'XXXX-XXXX-4589',
      ifscCode: 'HDFC0001234',
      upiId: 'rajeshkumar@okhdfcbank',
    },
    totalEarnings: 8450,
    pendingSettlement: 1850,
    settledAmount: 6600,
  });

  // Host 2: Sneha Reddy (Basic Host - Madhapur)
  const snehaUser = await User.create({
    name: 'Sneha Reddy',
    email: 'sneha.host@evhub.com',
    phone: '+91 98765 11002',
    passwordHash: defaultPassword,
    role: ROLES.OWNER,
    status: USER_STATUS.ACTIVE,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  });

  const snehaSub = await Subscription.create({
    ownerId: snehaUser._id,
    planId: basicPlan._id,
    razorpaySubscriptionId: 'sub_demo_sneha_basic',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: now,
    endDate: nextMonth,
    nextBillingDate: nextMonth,
    amount: basicPlan.price,
  });

  const snehaProfile = await OwnerProfile.create({
    userId: snehaUser._id,
    verificationStatus: OWNER_VERIFICATION.VERIFIED,
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    activeSubscriptionId: snehaSub._id,
    address: {
      street: 'Villa 12, Kavuri Hills, Madhapur',
      area: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      landmark: 'Behind Durgam Cheruvu Metro',
    },
    payoutDetailsReference: {
      accountHolderName: 'Sneha Reddy',
      bankName: 'ICICI Bank',
      accountNumberMasked: 'XXXX-XXXX-8921',
      ifscCode: 'ICIC0000452',
      upiId: 'snehareddy@icici',
    },
    totalEarnings: 4200,
    pendingSettlement: 900,
    settledAmount: 3300,
  });

  // Host 3: Vikram Sharma (Business Network - Jubilee Hills)
  const vikramUser = await User.create({
    name: 'Vikram Sharma',
    email: 'vikram.host@evhub.com',
    phone: '+91 98765 11003',
    passwordHash: defaultPassword,
    role: ROLES.OWNER,
    status: USER_STATUS.ACTIVE,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  });

  const vikramSub = await Subscription.create({
    ownerId: vikramUser._id,
    planId: businessPlan._id,
    razorpaySubscriptionId: 'sub_demo_vikram_business',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: now,
    endDate: nextMonth,
    nextBillingDate: nextMonth,
    amount: businessPlan.price,
  });

  const vikramProfile = await OwnerProfile.create({
    userId: vikramUser._id,
    verificationStatus: OWNER_VERIFICATION.VERIFIED,
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    activeSubscriptionId: vikramSub._id,
    address: {
      street: 'Road No 36, Jubilee Hills',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      landmark: 'Near Peddamma Temple',
    },
    payoutDetailsReference: {
      accountHolderName: 'Vikram Sharma',
      bankName: 'Axis Bank',
      accountNumberMasked: 'XXXX-XXXX-6110',
      ifscCode: 'UTIB0000889',
      upiId: 'vikramsharma@axisbank',
    },
    totalEarnings: 16800,
    pendingSettlement: 3500,
    settledAmount: 13300,
  });

  // Host 4 / Primary Alias: host1@evhub.com
  const host1User = await User.create({
    name: 'Primary Host (Demo)',
    email: 'host1@evhub.com',
    phone: '+91 98765 11000',
    passwordHash: 'HostPassword@123',
    role: ROLES.OWNER,
    status: USER_STATUS.ACTIVE,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  });

  const host1Sub = await Subscription.create({
    ownerId: host1User._id,
    planId: proPlan._id,
    razorpaySubscriptionId: 'sub_demo_host1_pro',
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: now,
    endDate: nextMonth,
    nextBillingDate: nextMonth,
    amount: proPlan.price,
  });

  await OwnerProfile.create({
    userId: host1User._id,
    verificationStatus: OWNER_VERIFICATION.VERIFIED,
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    activeSubscriptionId: host1Sub._id,
    address: {
      street: 'Villa 10, Green Meadows',
      area: 'Financial District',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500075',
      landmark: 'Near Wipro Circle',
    },
    payoutDetailsReference: {
      accountHolderName: 'Primary Host',
      bankName: 'HDFC Bank',
      accountNumberMasked: 'XXXX-XXXX-9900',
      ifscCode: 'HDFC0001824',
      upiId: 'host1@okhdfcbank',
    },
    totalEarnings: 12500,
    pendingSettlement: 2400,
    settledAmount: 10100,
  });

  console.log('[Seed] Created verified charging hosts with active subscriptions.');

  // 4. Create Sample EV Users
  const sampleUsersData = [
    { name: 'EV Driver 1 (Demo)', email: 'driver1@evhub.com', phone: '+91 91234 56700', vehicle: { make: 'Tata', model: 'Nexon EV Empowered', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 09 EV 0001', batteryCapacityKWh: 40.5, preferredConnector: 'CCS 2 DC' } },
    { name: 'Aditya Varma', email: 'aditya.user@evhub.com', phone: '+91 91234 56701', vehicle: { make: 'Tata', model: 'Nexon EV Empowered', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 09 EA 4120', batteryCapacityKWh: 40.5, preferredConnector: 'CCS 2 DC' } },
    { name: 'Pooja Iyer', email: 'pooja.user@evhub.com', phone: '+91 91234 56702', vehicle: { make: 'MG', model: 'ZS EV Exclusive', year: 2023, vehicleType: '4-Wheeler', registrationNumber: 'TS 08 FA 9811', batteryCapacityKWh: 50.3, preferredConnector: 'CCS 2 DC' } },
    { name: 'Karthik Rao', email: 'karthik.user@evhub.com', phone: '+91 91234 56703', vehicle: { make: 'Ather', model: '450X Gen 3', year: 2024, vehicleType: '2-Wheeler', registrationNumber: 'TS 07 HK 2045', batteryCapacityKWh: 3.7, preferredConnector: '15A 3-Pin Socket' } },
    { name: 'Ananya Gupta', email: 'ananya.user@evhub.com', phone: '+91 91234 56704', vehicle: { make: 'Hyundai', model: 'Ioniq 5', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 09 GH 7712', batteryCapacityKWh: 72.6, preferredConnector: 'CCS 2 DC' } },
    { name: 'Rohan Mehra', email: 'rohan.user@evhub.com', phone: '+91 91234 56705', vehicle: { make: 'Mahindra', model: 'XUV400 Pro', year: 2023, vehicleType: '4-Wheeler', registrationNumber: 'TS 10 EM 5509', batteryCapacityKWh: 39.4, preferredConnector: 'CCS 2 DC' } },
    { name: 'Deepa Krishnan', email: 'deepa.user@evhub.com', phone: '+91 91234 56706', vehicle: { make: 'Ola', model: 'S1 Pro Gen 2', year: 2024, vehicleType: '2-Wheeler', registrationNumber: 'TS 08 KK 1188', batteryCapacityKWh: 4.0, preferredConnector: '15A 3-Pin Socket' } },
    { name: 'Siddharth Nair', email: 'siddharth.user@evhub.com', phone: '+91 91234 56707', vehicle: { make: 'BYD', model: 'Atto 3', year: 2023, vehicleType: '4-Wheeler', registrationNumber: 'TS 09 LK 9090', batteryCapacityKWh: 60.48, preferredConnector: 'CCS 2 DC' } },
    { name: 'Meera Deshmukh', email: 'meera.user@evhub.com', phone: '+91 91234 56708', vehicle: { make: 'Tata', model: 'Tiago EV', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 07 TY 3412', batteryCapacityKWh: 24.0, preferredConnector: 'Type 2 AC' } },
    { name: 'Arjun Sen', email: 'arjun.user@evhub.com', phone: '+91 91234 56709', vehicle: { make: 'Kia', model: 'EV6 GT-Line', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 09 ZZ 0007', batteryCapacityKWh: 77.4, preferredConnector: 'CCS 2 DC' } },
    { name: 'Neha Joshi', email: 'neha.user@evhub.com', phone: '+91 91234 56710', vehicle: { make: 'Tata', model: 'Punch EV', year: 2024, vehicleType: '4-Wheeler', registrationNumber: 'TS 08 ER 6621', batteryCapacityKWh: 35.0, preferredConnector: 'Type 2 AC' } },
  ];

  const createdUsers = [];
  for (const u of sampleUsersData) {
    const userDoc = await User.create({
      name: u.name,
      email: u.email,
      phone: u.phone,
      passwordHash: defaultPassword,
      role: ROLES.USER,
      status: USER_STATUS.ACTIVE,
      vehicleDetails: u.vehicle,
    });
    createdUsers.push(userDoc);
  }
  console.log(`[Seed] Created ${createdUsers.length} sample EV drivers.`);

  // 5. Create 8 Sample Charging Stations across Hyderabad IT Corridor & Suburbs
  const sampleStationsData = [
    {
      ownerId: rajeshUser._id,
      name: 'CyberGrid Fast Charge - Gachibowli',
      description: 'High-speed 50kW CCS2 DC charging station located inside a secure residential villa community with 24/7 security guard.',
      address: {
        full: 'Plot 42, Telecom Nagar, Gachibowli, Hyderabad, Telangana 500032',
        street: 'Plot 42, Telecom Nagar',
        area: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        landmark: 'Near DLF Cyber City Gate 2',
      },
      location: { type: 'Point', coordinates: [78.3541, 17.4401] }, // [lng, lat]
      chargerBrand: 'Delta Electronics',
      chargerModel: 'CityCharger 50kW',
      chargerType: 'DC',
      connectorType: 'CCS 2 DC',
      chargingCapacity: 50,
      price: 18.5,
      priceUnit: 'kWh',
      operatingHours: { open: '06:00', close: '23:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 2,
      supportedVehicles: ['4-Wheeler'],
      amenities: ['Covered Parking', 'CCTV Surveillance', 'Waiting Lounge', 'Restroom', 'WiFi'],
      photos: [
        'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Equipped with dedicated commercial 63A isolator, Type B RCBO, earthing check relay, and fire extinguisher.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.9,
      totalReviews: 24,
    },
    {
      ownerId: rajeshUser._id,
      name: 'Telecom Nagar Green AC Point',
      description: 'Reliable 7.4kW Type 2 AC charger ideal for overnight or afternoon top-ups while visiting nearby tech parks.',
      address: {
        full: 'House 18, Telecom Nagar Phase 2, Gachibowli, Hyderabad, Telangana 500032',
        street: 'House 18, Phase 2',
        area: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        landmark: 'Near IIIT Hyderabad Junction',
      },
      location: { type: 'Point', coordinates: [78.3488, 17.4445] },
      chargerBrand: 'Schneider Electric',
      chargerModel: 'EVlink Home 7.4kW',
      chargerType: 'AC',
      connectorType: 'Type 2 AC',
      chargingCapacity: 7.4,
      price: 12.0,
      priceUnit: 'kWh',
      operatingHours: { open: '07:00', close: '22:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 1,
      supportedVehicles: ['4-Wheeler'],
      amenities: ['Covered Parking', 'CCTV Surveillance', 'Water Available'],
      photos: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Underground copper rod earthing, MCB + RCCB protection.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.8,
      totalReviews: 14,
    },
    {
      ownerId: snehaUser._id,
      name: 'Kavuri Hills Solar EV Oasis - Madhapur',
      description: '100% solar powered 22kW AC charger with lush garden waiting area, high-speed WiFi, and cafe nearby.',
      address: {
        full: 'Villa 12, Kavuri Hills Phase 1, Madhapur, Hyderabad, Telangana 500081',
        street: 'Villa 12, Phase 1',
        area: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        landmark: 'Next to Durgam Cheruvu Walking Track',
      },
      location: { type: 'Point', coordinates: [78.3915, 17.4483] },
      chargerBrand: 'ABB',
      chargerModel: 'Terra AC Wallbox 22kW',
      chargerType: 'AC',
      connectorType: 'Type 2 AC',
      chargingCapacity: 22,
      price: 14.5,
      priceUnit: 'kWh',
      operatingHours: { open: '06:00', close: '23:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 1,
      supportedVehicles: ['4-Wheeler', '3-Wheeler'],
      amenities: ['100% Solar Powered', 'WiFi', 'Restroom', 'Garden Seating', 'CCTV'],
      photos: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Solar hybrid inverter with built-in surge arrester and lightning protection.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 5.0,
      totalReviews: 31,
    },
    {
      ownerId: vikramUser._id,
      name: 'Jubilee Hills Fast HyperHub',
      description: 'Premium dual-connector 60kW DC HyperCharger equipped with both CCS2 and CHAdeMO connectors. Wide driveway.',
      address: {
        full: 'Road No 36, Near Checkpost, Jubilee Hills, Hyderabad, Telangana 500033',
        street: 'Plot 78, Road No 36',
        area: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        landmark: 'Opposite Peddamma Temple Metro',
      },
      location: { type: 'Point', coordinates: [78.4073, 17.4319] },
      chargerBrand: 'Tritium',
      chargerModel: 'Veefil-RT 60kW DC',
      chargerType: 'DC',
      connectorType: 'CCS 2 DC',
      chargingCapacity: 60,
      price: 21.0,
      priceUnit: 'kWh',
      operatingHours: { open: '00:00', close: '23:59', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 2,
      supportedVehicles: ['4-Wheeler'],
      amenities: ['24/7 Access', 'Covered Driveway', 'Valet Assistance', 'CCTV', 'Restroom'],
      photos: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Emergency shut-off push button, industrial grade IP54 enclosure, insulated mats.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.9,
      totalReviews: 48,
    },
    {
      ownerId: vikramUser._id,
      name: 'Financial District Corporate EV Hub',
      description: 'Convenient 11kW Type 2 station adjacent to Wipro Circle and WaveRock. Great for professionals during meetings.',
      address: {
        full: 'Sector 2, Nanakramguda, Financial District, Hyderabad, Telangana 500032',
        street: 'Sector 2, Nanakramguda',
        area: 'Financial District',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        landmark: '500m from WaveRock Tech Park',
      },
      location: { type: 'Point', coordinates: [78.3432, 17.4158] },
      chargerBrand: 'Exicom',
      chargerModel: 'Spin 11kW AC',
      chargerType: 'AC',
      connectorType: 'Type 2 AC',
      chargingCapacity: 11,
      price: 13.5,
      priceUnit: 'kWh',
      operatingHours: { open: '07:00', close: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      maximumCapacity: 1,
      supportedVehicles: ['4-Wheeler'],
      amenities: ['Shaded Bay', 'Air Conditioned Waiting Lounge', 'WiFi', 'CCTV'],
      photos: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Automatic voltage cutoff below 180V and above 270V.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.7,
      totalReviews: 19,
    },
    {
      ownerId: vikramUser._id,
      name: 'Banjara Hills Royal Charge',
      description: 'Residential 30kW DC CCS2 charger situated on Road No 12, Banjara Hills. Easily accessible wide entrance.',
      address: {
        full: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
        street: 'Villa 5, MLA Colony',
        area: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        landmark: 'Near Cancer Hospital',
      },
      location: { type: 'Point', coordinates: [78.4418, 17.4156] },
      chargerBrand: 'Statiq',
      chargerModel: 'Nova DC 30kW',
      chargerType: 'DC',
      connectorType: 'CCS 2 DC',
      chargingCapacity: 30,
      price: 19.0,
      priceUnit: 'kWh',
      operatingHours: { open: '06:00', close: '23:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 1,
      supportedVehicles: ['4-Wheeler'],
      amenities: ['Drive-through Bay', 'CCTV', 'Filtered Water', 'Covered Port'],
      photos: [
        'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Type 1 + Type 2 SPD surge protection, dual earth electrodes.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.8,
      totalReviews: 22,
    },
    {
      ownerId: rajeshUser._id,
      name: 'HITEC City Metro EV Point',
      description: 'Dual Type 2 AC charger located 200m from HITEC City metro station. Perfect for commuters leaving vehicle parked.',
      address: {
        full: 'Plot 10, HUDA Techno Enclave, HITEC City, Hyderabad, Telangana 500081',
        street: 'Plot 10, Techno Enclave',
        area: 'HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        landmark: 'Behind Cyber Towers',
      },
      location: { type: 'Point', coordinates: [78.3820, 17.4474] },
      chargerBrand: 'Tata Power EZ Charge',
      chargerModel: 'Dual 7.4kW AC',
      chargerType: 'AC',
      connectorType: 'Type 2 AC',
      chargingCapacity: 7.4,
      price: 12.5,
      priceUnit: 'kWh',
      operatingHours: { open: '06:00', close: '22:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 2,
      supportedVehicles: ['4-Wheeler', '2-Wheeler'],
      amenities: ['Metro Proximity', 'CCTV', 'Illuminated Bay', 'Security Guard'],
      photos: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Separate MCB per outlet, residual current device with 30mA trip threshold.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.9,
      totalReviews: 37,
    },
    {
      ownerId: snehaUser._id,
      name: 'Kondapur Community EV Charge',
      description: 'Versatile charging point offering both Type 2 AC and a dedicated 15A 3-Pin industrial socket for two-wheelers.',
      address: {
        full: 'Raghavendra Colony, Kondapur, Hyderabad, Telangana 500084',
        street: 'Street 3, Raghavendra Colony',
        area: 'Kondapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500084',
        landmark: 'Near Botanical Garden Road',
      },
      location: { type: 'Point', coordinates: [78.3619, 17.4682] },
      chargerBrand: 'Legrand',
      chargerModel: 'GreenUp Premium 3.7kW - 7.4kW',
      chargerType: 'AC',
      connectorType: 'Type 2 AC',
      chargingCapacity: 7.4,
      price: 11.0,
      priceUnit: 'kWh',
      operatingHours: { open: '06:00', close: '23:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      maximumCapacity: 1,
      supportedVehicles: ['4-Wheeler', '2-Wheeler', '3-Wheeler'],
      amenities: ['Two Wheeler Friendly', 'Tire Pressure Gauge', 'Covered Parking', 'CCTV'],
      photos: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      ],
      safetyDetails: 'Heavy duty metal clad box with MCB and dedicated neutral grounding.',
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
      isPubliclyListed: true,
      rating: 4.6,
      totalReviews: 12,
    },
  ];

  const createdStations = [];
  for (const st of sampleStationsData) {
    const stationDoc = await ChargingStation.create(st);
    createdStations.push(stationDoc);
  }
  console.log(`[Seed] Created ${createdStations.length} approved charging stations with 2dsphere indexes.`);

  // 6. Create Realistic Sample Bookings, Transactions & Reviews
  const station1 = createdStations[0]; // CyberGrid Gachibowli
  const station3 = createdStations[2]; // Kavuri Hills Madhapur
  const station4 = createdStations[3]; // Jubilee Hills HyperHub

  const user1 = createdUsers[0]; // Aditya
  const user2 = createdUsers[1]; // Pooja
  const user3 = createdUsers[2]; // Karthik
  const user4 = createdUsers[3]; // Ananya

  // Booking 1: Completed Booking for Aditya at Gachibowli
  const b1Start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
  b1Start.setHours(10, 0, 0, 0);
  const b1End = new Date(b1Start.getTime() + 60 * 60 * 1000); // 1 hr

  const booking1 = await Booking.create({
    userId: user1._id,
    ownerId: station1.ownerId,
    stationId: station1._id,
    startTime: b1Start,
    endTime: b1End,
    durationMinutes: 60,
    bookingStatus: BOOKING_STATUS.COMPLETED,
    totalAmount: 450,
    baseAmount: 420,
    platformFee: 42,
    ownerEarning: 378,
    taxAmount: 21,
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    gatewayOrderId: 'order_demo_seed_001',
    gatewayPaymentId: 'pay_demo_seed_001',
    verificationCode: '492810',
    sessionStartedAt: b1Start,
    sessionCompletedAt: b1End,
    isReviewed: true,
  });

  await Transaction.create({
    bookingId: booking1._id,
    ownerId: station1.ownerId,
    userId: user1._id,
    type: 'BOOKING_REVENUE',
    grossAmount: 450,
    platformCommission: 42,
    gatewayFee: 9,
    ownerNetAmount: 378,
    settlementStatus: SETTLEMENT_STATUS.SETTLED,
    settlementReference: 'PAYOUT_AXIS_77218',
    settledAt: now,
  });

  await Review.create({
    userId: user1._id,
    stationId: station1._id,
    bookingId: booking1._id,
    rating: 5,
    comment: 'Super fast 50kW charging! The host Rajesh was very courteous and the villa driveway was easy to navigate. Saved my day before heading to airport.',
    ownerReply: {
      comment: 'Thank you Aditya! Always welcome back.',
      repliedAt: now,
    },
  });

  // Booking 2: Completed Booking for Pooja at Madhapur
  const b2Start = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
  b2Start.setHours(14, 0, 0, 0);
  const b2End = new Date(b2Start.getTime() + 90 * 60 * 1000);

  const booking2 = await Booking.create({
    userId: user2._id,
    ownerId: station3.ownerId,
    stationId: station3._id,
    startTime: b2Start,
    endTime: b2End,
    durationMinutes: 90,
    bookingStatus: BOOKING_STATUS.COMPLETED,
    totalAmount: 320,
    baseAmount: 300,
    platformFee: 30,
    ownerEarning: 270,
    taxAmount: 15,
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    gatewayOrderId: 'order_demo_seed_002',
    gatewayPaymentId: 'pay_demo_seed_002',
    verificationCode: '883192',
    sessionStartedAt: b2Start,
    sessionCompletedAt: b2End,
    isReviewed: true,
  });

  await Transaction.create({
    bookingId: booking2._id,
    ownerId: station3.ownerId,
    userId: user2._id,
    type: 'BOOKING_REVENUE',
    grossAmount: 320,
    platformCommission: 30,
    gatewayFee: 6,
    ownerNetAmount: 270,
    settlementStatus: SETTLEMENT_STATUS.PENDING,
  });

  await Review.create({
    userId: user2._id,
    stationId: station3._id,
    bookingId: booking2._id,
    rating: 5,
    comment: 'Charging while sitting in the lovely garden with fast WiFi was amazing! Truly an oasis in Kavuri Hills.',
  });

  // Booking 3: Upcoming Confirmed Booking for Ananya at Jubilee Hills (Tomorrow)
  const b3Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  b3Start.setHours(11, 0, 0, 0);
  const b3End = new Date(b3Start.getTime() + 60 * 60 * 1000);

  const booking3 = await Booking.create({
    userId: user4._id,
    ownerId: station4.ownerId,
    stationId: station4._id,
    startTime: b3Start,
    endTime: b3End,
    durationMinutes: 60,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    totalAmount: 580,
    baseAmount: 550,
    platformFee: 55,
    ownerEarning: 495,
    taxAmount: 28,
    paymentStatus: PAYMENT_STATUS.SUCCESS,
    gatewayOrderId: 'order_demo_seed_003',
    gatewayPaymentId: 'pay_demo_seed_003',
    verificationCode: '612349',
    qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%2339F28A"/></svg>',
  });

  await Transaction.create({
    bookingId: booking3._id,
    ownerId: station4.ownerId,
    userId: user4._id,
    type: 'BOOKING_REVENUE',
    grossAmount: 580,
    platformCommission: 55,
    gatewayFee: 11,
    ownerNetAmount: 495,
    settlementStatus: SETTLEMENT_STATUS.PENDING,
  });

  // Seed Notifications
  await Notification.create({
    userId: admin._id,
    title: 'Platform System Ready ⚡',
    message: 'EV Hub initialized with Hyderabad IT corridor sample stations and demo host network.',
    type: 'SYSTEM',
  });

  console.log('[Seed] Database successfully seeded with full production-style test environment!');
};

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] Database is empty. Auto-seeding initial demo data...');
      await seedDatabase();
    } else {
      console.log(`[Seed] Database already contains ${userCount} users. Skipping auto-seed.`);
    }
  } catch (err) {
    console.error('[Seed] Error during auto-seed check:', err);
  }
};

// Run directly from CLI if invoked via node
if (process.argv[1]?.endsWith('seedData.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      console.log('[Seed] Seed script finished cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[Seed] CLI Seed failed:', err);
      process.exit(1);
    }
  })();
}

