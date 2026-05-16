import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class QrService {

  constructor(
    private jwtService: JwtService,
  ) {}

  generarTokenQR(
    alumnoId: number,
    materiaId: number,
    sesionId: string,
    
  ) {


    const payload = {

      alumnoId,

      materiaId,

      sesionId,

      timestamp: Date.now(),
    };

        //AGREGAMOS ESTO 
    console.log(process.env.JWT_SECRET);

    const token =
  this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_SECRET,

        expiresIn: '15s',
      },
    );

    return {
      token,
    };
  }
}