
import { DeviceModel, RepairIssue, Brand, Review, Booking } from './types';
import { Smartphone, Battery, Droplets, Camera, Zap, HelpCircle } from 'lucide-react';
import React from 'react';

export const BRANDS: { id: Brand; name: string; logo: string }[] = [
  { id: 'Apple', name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'Samsung', name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { id: 'Google', name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
  { id: 'Other', name: 'Other', logo: '' },
];

export const MODELS: Record<Brand, DeviceModel[]> = {
  Apple: [
    { id: 'ip15pm', name: 'iPhone 15 Pro Max', brand: 'Apple' },
    { id: 'ip15p', name: 'iPhone 15 Pro', brand: 'Apple' },
    { id: 'ip15', name: 'iPhone 15', brand: 'Apple' },
    { id: 'ip14pm', name: 'iPhone 14 Pro Max', brand: 'Apple' },
    { id: 'ip14', name: 'iPhone 14', brand: 'Apple' },
    { id: 'ip13', name: 'iPhone 13', brand: 'Apple' },
  ],
  Samsung: [
    { id: 's24u', name: 'Galaxy S24 Ultra', brand: 'Samsung' },
    { id: 's24', name: 'Galaxy S24', brand: 'Samsung' },
    { id: 's23u', name: 'Galaxy S23 Ultra', brand: 'Samsung' },
    { id: 'zfold5', name: 'Galaxy Z Fold 5', brand: 'Samsung' },
  ],
  Google: [
    { id: 'p8p', name: 'Pixel 8 Pro', brand: 'Google' },
    { id: 'p8', name: 'Pixel 8', brand: 'Google' },
    { id: 'p7a', name: 'Pixel 7a', brand: 'Google' },
  ],
  Other: [
    { id: 'generic', name: 'Generic / Other Model', brand: 'Other' },
  ],
};

export const INITIAL_ISSUES: RepairIssue[] = [
  { 
    id: 'screen', 
    name: 'Screen Replacement', 
    priceRange: '₱3,500 - ₱12,000', 
    duration: '45 mins', 
    description: 'Cracked glass, dead pixels, or touch issues.',
    iconName: 'screen'
  },
  { 
    id: 'battery', 
    name: 'Battery Replacement', 
    priceRange: '₱1,500 - ₱4,000', 
    duration: '30 mins', 
    description: 'Draining fast, not charging, or unexpected shutdowns.',
    iconName: 'battery'
  },
  { 
    id: 'port', 
    name: 'Charging Port Repair', 
    priceRange: '₱1,200 - ₱2,500', 
    duration: '45 mins', 
    description: 'Device not charging or cable fits loosely.',
    iconName: 'charging'
  },
  { 
    id: 'camera', 
    name: 'Camera Repair', 
    priceRange: '₱2,500 - ₱6,000', 
    duration: '60 mins', 
    description: 'Blurry photos, cracked lens, or black screen.',
    iconName: 'camera'
  },
  { 
    id: 'water', 
    name: 'Water Damage', 
    priceRange: '₱1,000 Diagnostic', 
    duration: '24-48 hours', 
    description: 'Deep cleaning and corrosion removal.',
    iconName: 'water'
  },
  { 
    id: 'diagnosis', 
    name: 'General Diagnosis', 
    priceRange: 'Free', 
    duration: '15 mins', 
    description: 'Not sure what is wrong? We will check it out.',
    iconName: 'other'
  },
];

export const INITIAL_TIMESLOTS = [
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
];

export const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    rating: 5,
    text: "Fixed my shattered iPhone 14 Pro Max screen in less than an hour. Looks brand new! Highly recommended.",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Mike Ross",
    rating: 5,
    text: "I thought my Pixel was a goner after dropping it in water. They managed to save it and the data. Lifesavers!",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Emily Chen",
    rating: 4,
    text: "Great service and friendly staff. Battery replacement was quick. Price was fair compared to Apple store.",
    date: "3 weeks ago"
  }
];

export const MOCK_BOOKINGS: Booking[] = [];

export const getIcon = (name: RepairIssue['iconName'], className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch(name) {
    case 'screen': return <Smartphone {...props} />;
    case 'battery': return <Battery {...props} />;
    case 'charging': return <Zap {...props} />;
    case 'camera': return <Camera {...props} />;
    case 'water': return <Droplets {...props} />;
    case 'other': return <HelpCircle {...props} />;
    default: return <HelpCircle {...props} />;
  }
};
