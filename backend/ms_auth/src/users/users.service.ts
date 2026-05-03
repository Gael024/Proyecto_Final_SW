import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      role: registerDto.role,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

//Prueba para control de acceso
    async findAll():Promise<User[]> {
      return this.usersRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
    }

    async updateRefreshTokenHash(
  userId: string,
  refreshTokenHash: string,
): Promise<void> {
  await this.usersRepository.update(userId, {
    refreshTokenHash,
  });
}

async findByIdWithRefreshToken(id: string): Promise<User> {
  const user = await this.usersRepository
    .createQueryBuilder('user')
    .addSelect('user.refreshTokenHash')
    .where('user.id = :id', { id })
    .getOne();

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return user;
}

async clearRefreshToken(userId: string): Promise<void> {
  await this.usersRepository.update(userId, {
    refreshTokenHash: null,
  });
}

async updatePassword(userdId: string, passwordHash: string): Promise<void> {
  await this.usersRepository.update(userdId, {
    passwordHash,
    refreshTokenHash: null,
  });
}


}