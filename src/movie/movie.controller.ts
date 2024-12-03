import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { MovieSortBy } from './definition/movie-response.interface';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';

@Controller('movie')
@UseGuards(JwtAuthGuard)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('poster', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only images allowed'), false);
        }
      },
    }),
  )
  createMovie(
    @Body() dto: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() userId: string,
  ) {
    return this.movieService.createMovie(dto, file, userId);
  }

  @Get()
  getMovies(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 8,
    @Query('sortBy') sortBy: MovieSortBy = 'createdAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @GetUser() userId: string,
  ) {
    return this.movieService.getMovies(
      search,
      userId,
      page,
      limit,
      sortBy,
      order,
    );
  }

  @Get(':id')
  getMovie(@Param('id') id: string, @GetUser() userId: string) {
    return this.movieService.getMovie(id, userId);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('poster', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only images allowed'), false);
        }
      },
    }),
  )
  updateMovie(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() userId: string,
  ) {
    return this.movieService.updateMovie(id, dto, file, userId);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string, @GetUser() userId: string) {
    return this.movieService.deleteMovie(id, userId);
  }
}
