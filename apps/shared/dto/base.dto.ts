import { IsOptional, IsString, IsUUID } from 'class-validator'

export class BaseDto {
  @IsOptional()
  @IsUUID()
  id?: string

  @IsOptional()
  @IsString()
  createdAt?: Date

  @IsOptional()
  @IsString()
  updatedAt?: Date
}
