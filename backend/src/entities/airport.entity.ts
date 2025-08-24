import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('airports')
export class AirportEntity {
  @PrimaryColumn()
  iataCode: string;

  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  cityName: string;

  @Column()
  country: string;

  @Column('jsonb', { nullable: true })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Column({ nullable: true })
  timezone: string;

  @UpdateDateColumn()
  updatedAt: Date;
}