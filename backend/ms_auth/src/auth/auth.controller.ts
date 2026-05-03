//import { Controller } from '@nestjs/common';
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { request } from 'http';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
    };
}

@Controller('auth')
export class AuthController {
    //constructor(private readonly authService: AuthService){}
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() LoginDto: LoginDto){
        return this.authService.login(LoginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() request: AuthenticatedRequest){
        return this.authService.me(request.user.id);
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('users')
    async fidnAllUsers(){
        const users = await this.usersService.findAll();
        return {
            success: true,
            data: users,
            message: 'Usuarios obtenidos correctamente',
        };
    
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('users/:id')
    async findUserById(@Param('id') id: string){
        const user = await this.usersService.findById(id);

        return {
            success: true,
            data: user,
            message: 'Usuario obtenido correctamente',
        };
    }

    @Post('refresh-token')
    refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto){
        return this.authService.refreshTokens(RefreshTokenDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() request: AuthenticatedRequest){
        return this.authService.logout(request.user.id);
    }

    @Post('forgot-password')
    forgotPassword(@Body() ForgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(ForgotPasswordDto);
    }

    @Post('reset-password')
    resetPassword(@Body() ResetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(ResetPasswordDto);
    }
}
