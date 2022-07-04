import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import AlbumsResolver from './resolvers/albums.resolver';
import AlbumsService from './services/albums.service';

@Module({
  imports: [HttpModule],
  providers: [AlbumsService, AlbumsResolver],
})
export default class AlbumsModule {}
