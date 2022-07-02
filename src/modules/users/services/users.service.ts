import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import 'dotenv/config';
import { Jwt } from '../../../graphql';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  __v: number;
}

@Injectable()
export default class UsersService {
  private usersUrl: string | undefined = process.env.USERS_URL;

  private readonly httpService!: HttpService;

  private NoUrlErrorMessage = 'Set up USER_URL in .env';

  constructor() {
    this.httpService = new HttpService();
  }

  findOneById(id: string): Promise<AxiosResponse<IUser>> {
    return new Promise((resolve, reject) => {
      if (this.usersUrl) {
        const url = `${this.usersUrl}/${id}`;
        resolve(this.httpService.axiosRef.get(url));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }

  getToken(email: string, password: string): Promise<AxiosResponse<Jwt>> {
    return new Promise((resolve, reject) => {
      if (this.usersUrl) {
        const url = `${this.usersUrl}/login`;
        const data = { email, password };
        resolve(this.httpService.axiosRef.post(url, data));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }

  register(data: Omit<IUser, '_id' | '__v'>): Promise<AxiosResponse<IUser>> {
    return new Promise((resolve, reject) => {
      if (this.usersUrl) {
        const url = `${this.usersUrl}/register`;
        resolve(this.httpService.axiosRef.post(url, data));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }
}
