import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../auth.service';

interface ValidateTokenRequest {
  token: string;
}

interface GetUserByIdRequest {
  userId: string;
}

interface CheckRoleRequest {
  userId: string;
  role: string;
}

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  validateToken(request: ValidateTokenRequest) {
    return this.authService.validateTokenForGrpc(request.token);
  }

  @GrpcMethod('AuthService', 'GetUserById')
  getUserById(request: GetUserByIdRequest) {
    return this.authService.getUserByIdForGrpc(request.userId);
  }

  @GrpcMethod('AuthService', 'CheckRole')
  checkRole(request: CheckRoleRequest) {
    return this.authService.checkRoleForGrpc(request.userId, request.role);
  }
}