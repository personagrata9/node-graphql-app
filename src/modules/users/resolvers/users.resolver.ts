import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, Jwt } from '../../../graphql';
import { IUser } from '../models/user.model';
import UsersService from '../services/users.service';

@Resolver('User')
export default class UsersResolver {
  private readonly usersService!: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  @Query()
  async user(@Args('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    return user;
  }

  @Query()
  async jwt(@Args('email') email: string, @Args('password') password: string): Promise<Jwt> {
    const jwt = await this.usersService.getToken(email, password);

    return jwt;
  }

  @Mutation()
  async register(
    @Args('firstName') firstName: string,
    @Args('secondName') secondName: string,
    @Args('password') password: string,
    @Args('email') email: string
  ): Promise<User> {
    const userInput: Omit<IUser, '_id'> = {
      firstName,
      lastName: secondName,
      password,
      email,
    };

    const user = await this.usersService.register(userInput);

    return user;
  }
}
