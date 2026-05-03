import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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


}