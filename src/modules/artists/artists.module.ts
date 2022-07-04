import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import ArtistsResolver from './resolvers/artists.resolver';
import ArtistsService from './services/artists.service';

@Module({
  imports: [HttpModule],
  providers: [ArtistsService, ArtistsResolver],
})
export default class ArtistsModule {}
