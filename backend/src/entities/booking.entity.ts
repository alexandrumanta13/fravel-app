import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BookingStatus, PaymentStatus } from '@fravel/shared';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingReference: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column('jsonb')
  flightData: any;

  @Column('jsonb')
  passengers: any[];

  @Column('jsonb', { nullable: true })
  contactDetails: any;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.bookings, { nullable: true })
  @JoinColumn()
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;
}