import { Module } from '@nestjs/common';

import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import { PeriodosClient } from './periodos.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PERIODOS_SERVICE',
        transport: Transport.GRPC,
        options: {
        package: 'periodos',
        protoPath: '/app/proto/periodos.proto',
        url: 'ms_periodos:50052',
        },
      },
    ]),
  ],
  providers: [PeriodosClient],
  exports: [PeriodosClient],
})
export class PeriodosModule {}