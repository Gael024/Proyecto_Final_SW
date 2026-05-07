import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';

import { Alumno } from './entities/alumno.entity';
import { MateriaAlumno } from './entities/materia-alumno.entity';

import { AuthClient } from '../auth/auth.client';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Alumno,
      MateriaAlumno,
    ]),

    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: '/app/proto/auth.proto',
        },
      },
    ]),
  ],

  controllers: [AlumnosController],

  providers: [
    AlumnosService,
    AuthClient,
  ],

  exports: [AlumnosService],
})
export class AlumnosModule {}