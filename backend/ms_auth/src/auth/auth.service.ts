import {  BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,

  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    return {
      success: true,
      data: this.sanitizeUser(user),
      message: 'Usuario registrado correctamente',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordIsValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    /*
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = await this.jwtService.signAsync(payload);
   */
    return {
      success: true,
      data: {
        ...tokens,
        user: this.sanitizeUser(user),
      },
      message: 'Inicio de sesión correcto',
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      success: true,
      data: this.sanitizeUser(user),
      message: 'Usuario autenticado',
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
  try {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      role: string;
    }>(refreshTokenDto.refreshToken, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'default_refresh_secret',
    });

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      success: true,
      data: tokens,
      message: 'Tokens renovados correctamente',
    };
  } catch {
    throw new UnauthorizedException('Refresh token inválido o expirado');
  }
}

async logout(userId: string) {
  await this.usersService.clearRefreshToken(userId);

  return {
    success: true,
    data: null,
    message: 'Sesión cerrada correctamente',
  };
}

private async generateTokens(user: User) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessTokenExpiresIn = (
    this.configService.get<string>('JWT_EXPIRES_IN') || '1h'
  ) as StringValue;

  const refreshTokenExpiresIn = (
    this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d'
  ) as StringValue;

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default_secret',
      expiresIn: accessTokenExpiresIn,
    }),
    this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'default_refresh_secret',
      expiresIn: refreshTokenExpiresIn,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}

private async saveRefreshToken(userId: string, refreshToken: string) {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
}


async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  const user = await this.usersService.findByEmail(forgotPasswordDto.email);

  if (!user) {
    return {
      success: true,
      data: null,
      message:
        'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = this.hashResetToken(rawToken);

  const expiresInMinutes =
    this.configService.get<number>('PASSWORD_RESET_EXPIRES_MINUTES') || 15;

  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const resetToken = this.passwordResetTokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    usedAt: null,
  });

  await this.passwordResetTokenRepository.save(resetToken);

  const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

  return {
    success: true,
    data: isProduction
      ? null
      : {
          resetToken: rawToken,
          expiresAt,
        },
    message:
      'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
  };
}

async resetPassword(resetPasswordDto: ResetPasswordDto) {
  const tokenHash = this.hashResetToken(resetPasswordDto.token);

  const resetToken = await this.passwordResetTokenRepository.findOne({
    where: {
      tokenHash,
    },
  });

  if (!resetToken) {
    throw new BadRequestException('Token inválido');
  }

  if (resetToken.usedAt) {
    throw new BadRequestException('El token ya fue utilizado');
  }

  if (resetToken.expiresAt < new Date()) {
    throw new BadRequestException('El token ya expiró');
  }

  const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

  await this.usersService.updatePassword(resetToken.userId, passwordHash);

  resetToken.usedAt = new Date();
  await this.passwordResetTokenRepository.save(resetToken);

  return {
    success: true,
    data: null,
    message: 'Contraseña restablecida correctamente',
  };
}

private hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async validateTokenForGrpc(token: string) {
  try {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      role: string;
    }>(token, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default_secret',
    });

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      return {
        valid: false,
        user: null,
      };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  } catch {
    return {
      valid: false,
      user: null,
    };
  }
}

async getUserByIdForGrpc(userId: string) {
  try {
    const user = await this.usersService.findById(userId);

    return {
      found: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      return {
        found: false,
        user: null,
      };
    }

    throw error;
  }
}

async checkRoleForGrpc(userId: string, role: string) {
  try {
    const user = await this.usersService.findById(userId);

    return {
      hasRole: user.isActive && user.role === role,
    };
  } catch {
    return {
      hasRole: false,
    };
  }
}


}