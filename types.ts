
export type Brand = 'Apple' | 'Samsung' | 'Google' | 'Other';

export interface DeviceModel {
  id: string;
  name: string;
  brand: Brand;
  image?: string;
}

export interface RepairIssue {
  id: string;
  name: string;
  priceRange: string;
  duration: string;
  description: string;
  iconName: 'screen' | 'battery' | 'water' | 'camera' | 'charging' | 'other';
}

export interface BookingState {
  step: 'brand' | 'model' | 'issue' | 'schedule' | 'confirm' | 'success';
  selectedBrand: Brand | null;
  selectedModel: DeviceModel | null;
  selectedIssue: RepairIssue | null;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  aiDiagnosis?: string;
}

export type BookingStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  status: BookingStatus;
  dateCreated: string;
  selectedBrand: Brand;
  selectedModel: string; // Model Name
  selectedIssue: string; // Issue Name
  price: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
