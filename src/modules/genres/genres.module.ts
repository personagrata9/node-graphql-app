import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import GenresResolver from './resolvers/genres.resolver';
import GenresService from './services/genres.service';

@Module({
  imports: [HttpModule],
  providers: [GenresService, GenresResolver],
})
export default class GenresModule {}
