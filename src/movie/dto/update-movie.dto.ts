import { IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Max(new Date().getFullYear())
  year?: number;

  @IsString()
  @IsOptional()
  poster?: string;
}
