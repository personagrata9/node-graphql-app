import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, Jwt, UserInput } from '../../../graphql';
import UsersService from '../services/users.service';

@Resolver('User')
export default class UsersResolver {
  private readonly usersService!: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  @Query()
  async user(@Args('id') id: string): Promise<User | null> {
    const user = await this.usersService.findOneById(id);

    return user;
  }

  @Query()
  async jwt(@Args('email') email: string, @Args('password') password: string): Promise<Jwt | Error> {
    const jwt = await this.usersService.getToken(email, password);

    return jwt;
  }

  @Mutation()
  async register(@Args('input') input: UserInput): Promise<User | Error> {
    const user = await this.usersService.register(input);

    return user;
  }
}
