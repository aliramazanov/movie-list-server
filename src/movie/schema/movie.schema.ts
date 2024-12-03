import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/auth/schema/user.schema';

export type MovieDocument = Movie &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  year: number;

  @Prop()
  poster: string;

  @Prop()
  posterPublicId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

MovieSchema.index({ title: 'text' });
