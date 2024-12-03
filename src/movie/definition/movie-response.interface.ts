export interface MovieResponse {
  id: string;
  title: string;
  year: number;
  poster?: string;
  userId: string;
  createdAt: Date;
}

export interface MoviesResponse {
  movies: MovieResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export type MovieSortBy = 'createdAt' | 'title' | 'year';
