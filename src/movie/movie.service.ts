import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MovieSortBy } from './definition/movie-response.interface';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './schema/movie.schema';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movies: Model<MovieDocument>,
    private cloudinary: CloudinaryService,
  ) {}

  async createMovie(
    dto: CreateMovieDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      const { url: posterUrl, publicId } =
        await this.cloudinary.uploadImage(file);
      const movie = await this.movies.create({
        ...dto,
        poster: posterUrl,
        posterPublicId: publicId,
        user: userId,
      });
      return this.formatMovie(movie);
    } catch (error) {
      throw new BadRequestException('Failed to create movie');
    }
  }

  async getMovies(
    search: string,
    userId: string,
    page = 1,
    limit = 8,
    sortBy: MovieSortBy = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const query = {
      user: userId,
      ...(search && { $text: { $search: search } }),
    };
    const skip = (page - 1) * limit;

    const [movies, total, totalMovies] = await Promise.all([
      this.movies
        .find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      this.movies.countDocuments(query),
      this.movies.countDocuments({ user: userId }),
    ]);

    return {
      movies: movies.map(this.formatMovie),
      total,
      totalMovies,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  async getMovie(id: string, userId: string) {
    const movie = await this.movies.findOne({ _id: id, user: userId }).exec();
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return this.formatMovie(movie);
  }

  async updateMovie(
    id: string,
    dto: UpdateMovieDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const movie = await this.movies.findOne({ _id: id, user: userId });
    if (!movie) throw new NotFoundException('Movie not found');

    if (file) {
      if (movie.posterPublicId) {
        await this.cloudinary.deleteImage(movie.posterPublicId);
      }
      const { url: posterUrl, publicId } =
        await this.cloudinary.uploadImage(file);
      dto.poster = posterUrl;
      movie.posterPublicId = publicId;
    }

    Object.assign(movie, dto);
    await movie.save();
    return this.formatMovie(movie);
  }

  async deleteMovie(id: string, userId: string) {
    const movie = await this.movies.findOneAndDelete({ _id: id, user: userId });
    if (!movie) throw new NotFoundException('Movie not found');

    if (movie.posterPublicId) {
      await this.cloudinary.deleteImage(movie.posterPublicId);
    }

    return { id, message: 'Movie deleted' };
  }

  private formatMovie(movie: MovieDocument) {
    return {
      id: movie._id,
      title: movie.title,
      year: movie.year,
      poster: movie.poster,
      userId: movie.user,
      createdAt: movie.createdAt,
    };
  }
}
