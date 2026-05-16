import { Injectable } from '@nestjs/common';

import { createClient } from 'redis';

@Injectable()
export class RedisService {

  private client;

  constructor() {

    this.client = createClient({

      socket: {

        host: process.env.REDIS_HOST,

        port: Number(
          process.env.REDIS_PORT,
        ),
      },
    });

    this.client.connect();

    this.client.on(
      'error',
      (err) => {
        console.log(
          'Redis Error',
          err,
        );
      },
    );
  }

  async guardarTokenUsado(
    token: string,
  ) {

    await this.client.set(
      token,
      'usado',
      {
        EX: 15,
      },
    );
  }

  async tokenYaUsado(
    token: string,
  ) {

    const existe =
      await this.client.get(token);

    return !!existe;
  }
}