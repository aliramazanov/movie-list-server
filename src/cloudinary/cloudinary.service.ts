import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as Sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File | undefined,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) return { url: '', publicId: '' };

    try {
      const optimizedBuffer = await Sharp(file.buffer)
        .resize(800, 1200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const result = await this.uploadToCloudinary(optimizedBuffer);
      return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Failed to process image');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }

  private uploadToCloudinary(buffer: Buffer) {
    return new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'movie-posters',
            timeout: 10000,
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        );
        upload.end(buffer);
      },
    );
  }
}
