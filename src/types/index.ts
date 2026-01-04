// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'petOwner' | 'petSitter' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profileImage?: string;
  phoneNumber?: string;
  address?: Address;
  pets?: Pet[];
  certifications?: Certification[];
  rating?: number;
  totalBookings?: number;
  directMessaging?: DirectMessagingSettings;
  // Role-specific fields
  paymentMethodPreference?: PaymentMethod;
  emergencyContact?: EmergencyContact;
  petFirstAidCertified?: boolean;
  bio?: string;
  skills?: string[];
}

export interface Address {
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  specialNeeds?: string[];
  imageUrl?: string;
  ownerId: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationUrl?: string;
}

export interface DirectMessagingSettings {
  allowOwnerChats?: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
}

// Booking Types
export interface Booking {
  id: string;
  clientId: string;
  clientName?: string; // Client's display name (denormalized for performance)
  sitterId?: string | null;
  serviceType: ServiceType;
  status: BookingStatus;
  scheduledDate: Date;
  duration: number; // minutes
  pets?: string[]; // Pet names for this booking
  address?: Address | null;
  specialInstructions?: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  visitNotes?: string | null;
  visitPhotos?: string[] | null;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  routeData?: RouteData | null;
  
  // Enhanced audit trail (admin booking creation)
  createdBy?: string; // Who created the booking (admin or client ID)
  createdByRole?: 'admin' | 'petOwner' | 'system'; // Role of creator
  adminCreated?: boolean; // Quick filter flag
  createdVia?: 'web-admin' | 'ios-app' | 'api' | 'webhook'; // Creation source
  lastModifiedBy?: string | null; // Who last modified (for audit trail)
  modificationReason?: string | null; // Reason for modification
  
  // Enhanced payment tracking
  paymentMethod?: PaymentMethod | null; // Payment method used
  paymentStatus?: PaymentStatus | null; // Payment status
  paymentTransactionId?: string | null; // Payment processor transaction ID
  paymentAmount?: number | null; // Payment amount
  paymentCollectedBy?: string | null; // Admin ID who collected cash
  paymentReceivedAt?: Date | null; // Timestamp when cash was received
  skipPaymentValidation?: boolean; // Skip payment for cash/comp bookings
  
  // ✅ FIX: Recurring booking tracking
  recurringSeriesId?: string | null; // Links to parent recurringSeries document
  visitNumber?: number | null; // Visit number in series (1, 2, 3, ...)
  isRecurring?: boolean; // Flag indicating this booking is part of a recurring series
  
  // Square invoice integration fields
  squareInvoiceId?: string | null; // Square invoice ID
  squareOrderId?: string | null; // Square order ID
  squareCustomerId?: string | null; // Square customer ID
  squareInvoiceUrl?: string | null; // URL to view invoice in Square dashboard
  squarePaymentId?: string | null; // Square payment ID (after payment is processed)
  squareInvoiceNumber?: string | null; // Human-readable invoice number (e.g., "INV-001")
}

export type ServiceType = 'dog-walking' | 'pet-sitting' | 'overnight-care' | 'drop-in-visit' | 'transport';

export type BookingStatus = 'pending' | 'approved' | 'scheduled' | 'active' | 'completed' | 'cancelled' | 'rejected';

export type PaymentMethod = 'square' | 'apple_pay' | 'cash' | 'check' | 'invoice' | 'comp';

export type PaymentStatus = 'pending' | 'confirmed' | 'declined' | 'failed' | 'cancelled' | 'waived';

export interface RouteData {
  points: LocationPoint[];
  totalDistance: number; // meters
  totalDuration: number; // seconds
  averageSpeed: number; // km/h
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

// Chat Types
export interface Conversation {
  id: string;
  participants: { userId: string }[];
  type?: 'admin-inquiry' | 'client-sitter' | 'sitter-to-client'; // Optional for backward compatibility
  lastMessage?: Message;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
  requiresApproval: boolean;
  unreadCount: number;
  messageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'admin' | 'petOwner' | 'petSitter';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document';
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: Date;
  readBy: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Analytics Types
export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
  bookingsByStatus: Record<BookingStatus, number>;
  revenueByMonth: MonthlyRevenue[];
  topSitters: SitterPerformance[];
  serviceTypeDistribution: ServiceDistribution[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface SitterPerformance {
  sitterId: string;
  sitterName: string;
  totalBookings: number;
  averageRating: number;
  totalRevenue: number;
}

export interface ServiceDistribution {
  serviceType: ServiceType;
  count: number;
  percentage: number;
}

// AI Assignment Types
export interface AssignmentResult {
  bookingId: string;
  sitterId?: string;
  sitterName?: string;
  assignmentMethod: 'aiAutomatic' | 'ruleBased' | 'adminManual' | 'failed';
  confidence: number;
  reasons: string[];
  timestamp: Date;
}

export interface AssignableSitter {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  petTypes: string[];
  availability: SitterAvailability;
  location?: LocationPoint;
  rating: number;
  totalBookings: number;
  distance?: number;
  lastAssigned?: Date;
  isAvailable: boolean;
}

export interface SitterAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  conversationId?: string;
  read: boolean;
  createdAt: Date;
}

// Filter Types
export interface BookingFilters {
  status?: BookingStatus[];
  serviceType?: ServiceType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sitterId?: string;
  clientId?: string;
  search?: string;
}

export interface UserFilters {
  role?: string[];
  isActive?: boolean;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Admin booking creation interface
export interface AdminBookingCreate {
  clientId: string;
  clientName: string; // Client's display name for the booking
  sitterId?: string | null;
  serviceType: ServiceType;
  scheduledDate: Date;
  duration: number;
  pets: string[];
  specialInstructions?: string;
  address?: Address;
  price: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  adminNotes?: string;
}

// Recurring booking types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringSeries {
  id: string;
  clientId: string;
  serviceType: ServiceType;
  numberOfVisits: number;
  frequency: RecurringFrequency;
  startDate: Date;
  preferredTime: string;
  preferredDays?: number[];
  basePrice: number;
  totalPrice: number;
  pets: string[];
  specialInstructions?: string;
  status: string;
  createdAt: Date;
  assignedSitterId?: string | null;
  preferredSitterId?: string | null;
  completedVisits: number;
  canceledVisits: number;
  upcomingVisits: number;
  duration: number;
}

export interface AdminRecurringBookingCreate {
  clientId: string;
  sitterId?: string | null;
  serviceType: ServiceType;
  numberOfVisits: number;
  frequency: RecurringFrequency;
  startDate: Date;
  preferredTime: string;
  preferredDays?: number[];
  duration: number;
  basePrice: number;
  pets: string[];
  specialInstructions?: string;
  address?: Address;
  paymentMethod: PaymentMethod;
  adminNotes?: string;
}

export interface RecurringBatchVisit {
  visitNumber: number;
  scheduledDate: Date;
}

export interface RecurringBatch {
  id: string;
  seriesId: string;
  clientId: string;
  serviceType: ServiceType;
  batchIndex: number;
  visitCount: number;
  status: 'scheduled' | 'processing' | 'completed' | 'failed' | 'rejected';
  scheduledFor: Date;
  approvalDate?: Date;
  invoiceDate?: Date;
  invoiceDueDate?: Date;
  timeZoneIdentifier?: string;
  visits: RecurringBatchVisit[];
}
