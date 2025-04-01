import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'admin' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'password' })
  password: string;
}
