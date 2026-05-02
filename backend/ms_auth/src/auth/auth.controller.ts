//import { Controller } from '@nestjs/common';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    constructor(private readonly authService: AuthService){}

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
}
