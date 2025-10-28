import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'
import { Column } from 'typeorm'

export class EventStoreFilterInput {
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  eventType?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsUUID()
  aggregateId?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  aggregateType?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsDateString()
  fromDate?: string

  @Column({ nullable: true })
  @IsOptional()
  @IsDateString()
  toDate?: string
}
