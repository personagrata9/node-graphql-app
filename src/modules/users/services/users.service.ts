import 'dotenv/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Jwt } from '../../../graphql';
import { IUser } from '../models/user.model';

@Injectable()
export default class UsersService {
  private url: string | undefined = process.env.USERS_URL;

  private readonly httpService!: HttpService;

  private NoUrlErrorMessage = 'Set up USER_URL in .env';

  constructor() {
    this.httpService = new HttpService();
  }

  findOneById(id: string): Promise<AxiosResponse<IUser>> {
    return new Promise((resolve, reject) => {
      if (this.url) {
        const url = `${this.url}/${id}`;
        resolve(this.httpService.axiosRef.get(url));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }

  getToken(email: string, password: string): Promise<AxiosResponse<Jwt>> {
    return new Promise((resolve, reject) => {
      if (this.url) {
        const url = `${this.url}/login`;
        const data = { email, password };
        resolve(this.httpService.axiosRef.post(url, data));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }

  register(data: Omit<IUser, '_id' | '__v'>): Promise<AxiosResponse<IUser>> {
    return new Promise((resolve, reject) => {
      if (this.url) {
        const url = `${this.url}/register`;
        resolve(this.httpService.axiosRef.post(url, data));
      } else {
        reject(new Error(this.NoUrlErrorMessage));
      }
    });
  }
}
