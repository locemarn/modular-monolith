import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('varchar', {
    length: 254,
    unique: true,
    comment: 'User Email address (Unique)',
  })
  email: string

  @Column('varchar', {
    length: 30,
    unique: true,
    comment: 'User Username (Unique)',
  })
  username: string

  @Column('varchar', {
    length: 254,
    comment: 'User Password',
  })
  password: string

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Timestamp of entity creation',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @UpdateDateColumn({
    type: 'timestamptz',
    comment: 'Timestamp of entity last update',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}
