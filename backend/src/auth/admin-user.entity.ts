import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  /** Stored lower-case. */
  @Column({ length: 160, unique: true })
  email: string;

  /** scrypt hash, never the plain password. */
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  /** True while the admin is still using the initial shared password. */
  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
