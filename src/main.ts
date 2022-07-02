import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import AppModule from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;

  await app.listen(port);
  process.stdout.write(`Server ready at http://localhost:${port}/graphql\n`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
