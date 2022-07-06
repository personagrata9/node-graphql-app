import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Jwt, User } from '../../../graphql';
import { IUser } from '../models/user.model';

@Injectable()
export default class UsersService {
  private baseUrl = process.env.USERS_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertUser = (data: IUser): User => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, firstName, lastName, password, email } = data;
    const convertedUser: User = {
      id: _id,
      firstName,
      secondName: lastName,
      password,
      email,
    };

    return convertedUser;
  };

  findOneById = async (id: string): Promise<User | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<IUser> = await this.httpService.axiosRef.get(url);
      const user = this.convertUser(response.data);

      return user;
    } catch {
      return null;
    }
  };

  getToken = async (email: string, password: string): Promise<Jwt> => {
    const url = `${this.baseUrl}/login`;
    const data = { email, password };
    const response: AxiosResponse<Jwt> = await this.httpService.axiosRef.post(url, data);
    const jwt = response.data;

    return jwt;
  };

  register = async (data: Omit<IUser, '_id'>): Promise<User> => {
    const url = `${this.baseUrl}/register`;
    const response: AxiosResponse<IUser> = await this.httpService.axiosRef.post(url, data);
    const user = this.convertUser(response.data);

    return user;
  };
}
