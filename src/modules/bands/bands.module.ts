import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import BandsResolver from './resolvers/bands.resolver';
import BandsService from './services/bands.service';

@Module({
  imports: [HttpModule],
  providers: [BandsService, BandsResolver],
})
export default class BandsModule {}
