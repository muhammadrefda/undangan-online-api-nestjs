import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Izinkan origin dari frontend production
  app.enableCors({
    origin: [
      'https://satuundangan.id',
      'https://www.satuundangan.id',
      'http://localhost:4000',
      'https://api.satuundangan.id',
      'http://localhost:5173',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // penting kalau pakai cookie atau header auth
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Undangan Online API')
    .setDescription('API dokumentasi untuk sistem undangan online ✨')
    .setVersion('1.0')
    .addBearerAuth() // Untuk JWT Authorization
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
