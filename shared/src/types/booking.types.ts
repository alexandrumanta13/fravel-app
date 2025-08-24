import { FlightResultDto, PassengerDto } from './flight.types';

export interface BookingRequestDto {
  flightId: string;
  passengers: BookingPassengerDto[];
  contactDetails: ContactDetailsDto;
  paymentDetails?: PaymentDetailsDto;
}

export interface BookingPassengerDto {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface ContactDetailsDto {
  email: string;
  phone: string;
  address?: AddressDto;
}

export interface AddressDto {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetailsDto {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  billingAddress: AddressDto;
}

export interface BookingResponseDto {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  flight: FlightResultDto;
  passengers: BookingPassengerDto[];
  totalPrice: number;
  currency: string;
  createdAt: string;
  paymentStatus: PaymentStatus;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}