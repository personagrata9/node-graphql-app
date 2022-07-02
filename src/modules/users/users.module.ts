import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import UsersResolver from './resolvers/users.resolver';
import UsersService from './services/users.service';

@Module({
  // controllers: [CatsController],
  imports: [HttpModule],
  providers: [UsersService, UsersResolver],
})
export default class UsersModule {}
