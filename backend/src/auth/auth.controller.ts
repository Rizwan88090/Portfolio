import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService, SESSION_COOKIE, SESSION_TTL_MS } from './auth.service';
import { AuthGuard, type AuthedRequest } from './auth.guard';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';
import { readCookie } from './cookies';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 5 attempts per minute per IP to slow down password guessing. */
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin } = await this.auth.login(dto.email, dto.password);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_TTL_MS });
    return { admin };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(readCookie(req, SESSION_COOKIE));
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return { admin: this.auth.toPublic(req.session.admin) };
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async changePassword(@Req() req: AuthedRequest, @Body() dto: ChangePasswordDto) {
    const admin = await this.auth.changePassword(req.session.admin.id, req.session.id, dto.currentPassword, dto.newPassword);
    return { admin };
  }
}
