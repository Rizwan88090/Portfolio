import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('admin_sessions')
export class AdminSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** SHA-256 of the random session token. The token itself only lives in the browser cookie. */
  @Index({ unique: true })
  @Column({ length: 64 })
  tokenHash: string;

  @ManyToOne(() => AdminUser, { onDelete: 'CASCADE', eager: true })
  admin: AdminUser;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
