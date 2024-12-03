import { User } from 'src/auth/schema/user.schema';

export interface IMovie {
  id: string;
  title: string;
  year: number;
  poster?: string;
  user: User | string;
  createdAt: Date;
  updatedAt: Date;
}
