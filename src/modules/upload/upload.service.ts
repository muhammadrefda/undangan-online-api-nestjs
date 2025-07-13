import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');

    // Retrieve all necessary variables from the ConfigService using getOrThrow for safety
    this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.getOrThrow<string>('R2_PUBLIC_URL');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Uploads a file to Cloudflare R2 and returns its public URL.
   * @param file The file to upload, compliant with Express.Multer.File.
   * @returns An object containing the public URL of the uploaded file and a success message.
   */
  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No file provided for upload.');
    }

    const fileKey = `${Date.now()}-${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // ✅ Correctly construct the final URL using your public domain
      return {
        fileUrl: `${this.publicUrl}/${fileKey}`,
        message: 'Upload successful ✅',
      };
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new InternalServerErrorException('Failed to upload file.');
    }
  }
}