import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface ValidateTokenResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

interface AuthServiceClient {
  validateToken(data: { token: string }): Observable<ValidateTokenResponse>;
}

@Injectable()
export class AdminGuard implements CanActivate, OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private client: any) {}

  onModuleInit() {
    this.authService = this.client.getService('AuthService') as AuthServiceClient;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    try {
      const response: ValidateTokenResponse = await firstValueFrom(
        this.authService.validateToken({ token }),
      );

      if (!response.valid || response.user.role !== 'ADMIN') {
        return false;
      }

      request.user = response.user;
      return true;
    } catch (e) {
      return false;
    }
  }
}
