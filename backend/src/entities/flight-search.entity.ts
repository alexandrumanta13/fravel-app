import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('flight_searches')
export class FlightSearchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  sessionId: string;

  @Column('jsonb')
  searchCriteria: any;

  @Column('jsonb', { nullable: true })
  results: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;
}