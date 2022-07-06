import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import TracksResolver from './resolvers/tracks.resolver';
import TracksService from './services/tracks.service';

@Module({
  imports: [HttpModule],
  providers: [TracksService, TracksResolver],
})
export default class TracksModule {}
