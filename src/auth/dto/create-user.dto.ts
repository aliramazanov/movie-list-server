import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(22)
  @IsNotEmpty()
  password: string;
}
