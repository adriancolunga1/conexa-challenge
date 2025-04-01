import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from '../../../common/guards';

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'user 1' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'password' })
  password: string;

  @IsNotEmpty()
  @IsEnum(Roles)
  @ApiProperty({ example: 'admin' })
  role: Roles;
}
