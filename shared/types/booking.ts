import { Flight } from './flight.js';

export interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
}

export interface BookingContact {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface PaymentDetails {
  method: 'credit-card' | 'debit-card' | 'paypal' | 'bank-transfer';
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Booking {
  id: string;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  flight: Flight;
  passengers: Passenger[];
  contact: BookingContact;
  payment?: PaymentDetails;
  totalPrice: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
  confirmationEmail?: string;
}

export interface BookingRequest {
  flightId: string;
  passengers: Passenger[];
  contact: BookingContact;
  payment: PaymentDetails;
}