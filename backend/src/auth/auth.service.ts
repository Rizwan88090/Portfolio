import { BadRequestException, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { LessThan, Not, Repository } from 'typeorm';
import { AdminUser } from './admin-user.entity';
import { AdminSession } from './admin-session.entity';
import { hashPassword, verifyPassword } from './password';
import { ADMIN_SEED } from './admins.seed';

export const SESSION_COOKIE = 'pc_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export type PublicAdmin = Pick<AdminUser, 'id' | 'name' | 'email' | 'mustChangePassword' | 'lastLoginAt'>;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AdminUser) private readonly users: Repository<AdminUser>,
    @InjectRepository(AdminSession) private readonly sessions: Repository<AdminSession>,
    private readonly config: ConfigService,
  ) {}

  /** Creates any missing admin from the seed list. Never resets an existing password. */
  async onModuleInit() {
    const initial = this.config.get<string>('ADMIN_DEFAULT_PASSWORD');
    if (!initial) {
      this.logger.warn('ADMIN_DEFAULT_PASSWORD is not set, skipping admin seeding');
      return;
    }
    for (const a of ADMIN_SEED) {
      const email = a.email.toLowerCase();
      if (await this.users.existsBy({ email })) continue;
      await this.users.save(
        this.users.create({ name: a.name, email, passwordHash: await hashPassword(initial), mustChangePassword: true }),
      );
      this.logger.log(`Created admin ${email}`);
    }
  }

  toPublic(u: AdminUser): PublicAdmin {
    return { id: u.id, name: u.name, email: u.email, mustChangePassword: u.mustChangePassword, lastLoginAt: u.lastLoginAt };
  }

  async login(email: string, password: string) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
    // Same message for unknown email and wrong password, so emails can't be probed.
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    await this.sessions.delete({ expiresAt: LessThan(new Date()) });
    const token = randomBytes(32).toString('base64url');
    await this.sessions.save(
      this.sessions.create({ tokenHash: sha256(token), admin: user, expiresAt: new Date(Date.now() + SESSION_TTL_MS) }),
    );
    user.lastLoginAt = new Date();
    await this.users.update(user.id, { lastLoginAt: user.lastLoginAt });
    return { token, admin: this.toPublic(user) };
  }

  /** Returns the session for a cookie token, or null if missing, expired or disabled. */
  async validate(token: string | undefined) {
    if (!token) return null;
    const session = await this.sessions.findOne({ where: { tokenHash: sha256(token) } });
    if (!session || session.expiresAt < new Date() || !session.admin?.active) return null;
    return session;
  }

  async logout(token: string | undefined) {
    if (token) await this.sessions.delete({ tokenHash: sha256(token) });
  }

  /** Changes the password and signs the admin out everywhere except this session. */
  async changePassword(adminId: string, sessionId: string, current: string, next: string) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: adminId })
      .getOneOrFail();
    if (!(await verifyPassword(current, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (current === next) throw new BadRequestException('New password must be different from the current one');
    await this.users.update(user.id, { passwordHash: await hashPassword(next), mustChangePassword: false });
    await this.sessions.delete({ admin: { id: user.id }, id: Not(sessionId) });
    return { ...this.toPublic(user), mustChangePassword: false };
  }
}
