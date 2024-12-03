import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryMovieDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 8;

  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'year' = 'year';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
