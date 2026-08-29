export type Role = "admin" | "technician" | "customer";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  specialization?: string;
  status: "active" | "inactive";
  profilePicture?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  city: string;
  address: string;
  company?: string;
  tags: string[];
  status: "active" | "inactive";
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  owner: Customer | string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";
  mileage: number;
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartUsed {
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Attachment {
  url: string;
  filename: string;
  fileType: string;
  uploadedBy?: User | string;
  uploadedAt: string;
}

export type JobCardStatus =
  | "open"
  | "assigned"
  | "diagnosis"
  | "in_progress"
  | "waiting_for_parts"
  | "waiting_for_customer_approval"
  | "completed"
  | "delivered"
  | "reopened";

export type Priority = "low" | "medium" | "high" | "critical";

export interface JobCard {
  _id: string;
  jobCardNumber: string;
  customer: Customer;
  vehicle: Vehicle;
  subject: string;
  description: string;
  serviceType: string;
  subService?: string;
  priority: Priority;
  status: JobCardStatus;
  assignedTo?: User;
  createdBy: User;
  source: string;
  attachments: Attachment[];
  slaDeadline?: string;
  slaBreached?: boolean;
  firstResponseAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  diagnosisNotes?: string;
  resolutionNotes?: string;
  partsUsed: PartUsed[];
  laborCharges: number;
  totalCost: number;
  customerApprovalStatus: "pending" | "approved" | "rejected";
  isEscalated: boolean;
  escalatedAt?: string;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobCardMessage {
  _id: string;
  jobCard: string;
  sender: User;
  senderRole: Role;
  message: string;
  type: "internal_note" | "customer_reply" | "email" | "phone" | "whatsapp" | "other";
  attachments: string[];
  createdAt: string;
}

export interface FollowUp {
  _id: string;
  jobCard: JobCard;
  assignedTo: User;
  date: string;
  time: string;
  type: "phone_call" | "email" | "whatsapp" | "in_person" | "other";
  status: "pending" | "completed" | "missed" | "rescheduled";
  notes: string;
  nextAction?: string;
  createdBy: User;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  jobCard: JobCard;
  customer: Customer;
  technician?: User;
  rating: number;
  comment: string;
  satisfactionStatus: "satisfied" | "neutral" | "unsatisfied";
  createdAt: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  subServices: string[];
  estimatedHours: number;
  status: "active" | "inactive";
}

export interface SLA {
  _id: string;
  priority: Priority;
  serviceType: string;
  responseTimeHours: number;
  turnaroundTimeHours: number;
  status: "active" | "inactive";
}

export interface ActivityLog {
  _id: string;
  user?: User;
  jobCard: JobCard | { _id: string; jobCardNumber: string; subject: string };
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedJobCard?: { _id: string; jobCardNumber: string; subject: string };
  createdAt: string;
}
