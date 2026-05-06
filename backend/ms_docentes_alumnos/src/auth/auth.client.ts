import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';



interface AuthService {
  ValidateToken(data: { token: string }): any;
}

@Injectable()
export class AuthClient implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  validateToken(token: string) {
    return this.authService.ValidateToken({ token });
  }
}