/* eslint-disable @typescript-eslint/naming-convention */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User, Jwt } from '../../../graphql';
import { IUser } from '../models/user.model';
import UsersService from '../services/users.service';

@Resolver('Users')
export default class UsersResolver {
  private readonly usersService!: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  private convertUser = (data: IUser): User => {
    const { _id, firstName, lastName, password, email } = data;
    const convertedUser = {
      id: _id,
      firstName,
      secondName: lastName,
      password,
      email,
    };

    return convertedUser;
  };

  @Query()
  async user(@Args('id') id: string): Promise<User> {
    const response = await this.usersService.findOneById(id);
    const user: User = this.convertUser(response.data);

    return user;
  }

  @Query()
  async jwt(@Args('email') email: string, @Args('password') password: string): Promise<Jwt> {
    const response = await this.usersService.getToken(email, password);
    const jwt = response.data;

    return jwt;
  }

  @Mutation()
  async register(
    @Args('firstName') firstName: string,
    @Args('secondName') secondName: string,
    @Args('password') password: string,
    @Args('email') email: string
  ): Promise<User> {
    const userInput = {
      firstName,
      lastName: secondName,
      password,
      email,
    };

    const response = await this.usersService.register(userInput);

    const user: User = this.convertUser(response.data);

    return user;
  }
}
