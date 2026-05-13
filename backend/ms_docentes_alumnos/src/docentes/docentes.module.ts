import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';
import { Docente } from './entities/docente.entity';

import { AuthClient } from '../grpc_clients/auth/auth.client';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: 'ms_auth:50051',
          package: 'auth',
          protoPath: '/app/proto/auth.proto',
        },
      },
    ]),

    TypeOrmModule.forFeature([Docente]),
  ],

  controllers: [DocentesController],

  providers: [
    DocentesService,
    AuthClient,
  ],

  exports: [DocentesService],
})
export class DocentesModule {}