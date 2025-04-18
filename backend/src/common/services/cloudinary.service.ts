import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    try {
      // Log Cloudinary configuration to verify credentials are loaded
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      this.logger.log(`Configuring Cloudinary with cloud_name: ${cloudName ? cloudName : 'MISSING'}, API key: ${apiKey ? 'PRESENT' : 'MISSING'}`);
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Cloudinary', error);
    }
  }

  async uploadImage(file: Express.Multer.File, folder = 'profile-pictures'): Promise<string> {
    try {
      this.logger.log(`Attempting to upload image to Cloudinary (${file.mimetype}, ${file.size} bytes) to folder: ${folder}`);
      
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'limit' }, 
              { quality: 'auto:good' }, 
            ],
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload error in callback:', error);
              return reject(error);
            }
            
            if (!result) {
              this.logger.error('No result returned from Cloudinary upload');
              return reject(new Error('Failed to upload image: No result returned'));
            }
            
            this.logger.log(`Image uploaded successfully to Cloudinary. URL: ${result.secure_url}`);
            resolve(result.secure_url);
          }
        );

        // Convert buffer to stream
        const fileStream = new Readable();
        fileStream.push(file.buffer);
        fileStream.push(null);
        
        // Log any stream errors
        fileStream.on('error', (err) => {
          this.logger.error('File stream error:', err);
          reject(err);
        });
        
        uploadStream.on('error', (err) => {
          this.logger.error('Upload stream error:', err);
          reject(err);
        });
        
        // Pipe the file stream to the upload stream
        fileStream.pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error('Cloudinary upload error in outer try-catch:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      this.logger.log(`Attempting to delete image with public ID: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image with public ID: ${publicId} deleted successfully`);
    } catch (error) {
      this.logger.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  // Extract public_id from Cloudinary URL
  getPublicIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      // Extract the public ID from a URL like:
      // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
      const regex = /\/v\d+\/(.+)\./;
      const match = url.match(regex);
      const publicId = match ? match[1] : null;
      this.logger.log(`Extracted public ID from URL: ${publicId}`);
      return publicId;
    } catch (error) {
      this.logger.error('Error extracting public ID:', error);
      return null;
    }
  }
}