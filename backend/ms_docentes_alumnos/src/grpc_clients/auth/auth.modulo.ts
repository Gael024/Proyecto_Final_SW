import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthClient } from './auth.client';

@Module({
  imports: [
    ClientsModule.register([{
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
        package: 'auth',
        protoPath: '/app/proto/auth.proto', 
        },
        },
    ]),
  ],

  providers: [AuthClient],

  exports: [AuthClient],
})
export class AuthModule {}