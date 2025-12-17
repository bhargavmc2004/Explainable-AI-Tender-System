
// FIX: Removed an erroneous import of `UserRole`. This type is defined within this file, and the import was causing a redeclaration error.
export enum UserRole {
  VENDOR = 'vendor',
  EMPLOYER = 'employer',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface VendorProfile {
  id: string;
  name:string;
  experience: number; // in years
  specialization: string[];
  location: string;
}

export enum TenderStatus {
  OPEN = 'Open for Bidding',
  CLOSED = 'Closed',
  AWARDED = 'Awarded',
}

export interface Bid {
  vendorId: string;
  amount: number;
  timestamp: string;
  status: 'Submitted' | 'Selected' | 'Rejected';
  explanation?: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  requiredExperience: number;
  expectedAmount: number;
  status: TenderStatus;
  deadline: string; // ISO 8601 format
  bids: Bid[];
  winner?: string; // vendorId
  createdBy: string; // employerId
}

export type Explanation = {
  positive: string[];
  negative: string[];
};