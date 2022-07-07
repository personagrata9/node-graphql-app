import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IGenre } from '../models/genre.model';
import { IGenresPaginated } from '../models/genresPaginated.model';
import { Genre } from '../../../graphql';

@Injectable()
export default class GenresService {
  private baseUrl = process.env.GENRES_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertGenre = (data: IGenre): Genre => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, name, description, country, year } = data;
    const convertedGenre: Genre = {
      id: _id,
      name,
      description,
      country,
      year: year ? +year : undefined,
    };

    return convertedGenre;
  };

  private checkGenreExistance = async (id: string): Promise<void> => {
    const genre = await this.findOneById(id);

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }
  };

  findOneById = async (id: string): Promise<Genre | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<IGenre> = await this.httpService.axiosRef.get(url);
      const genre = this.convertGenre(response.data);
      // ?? error in service

      return genre.id ? genre : null;
    } catch {
      return null;
    }
  };

  findAll = async (limit: number, offset: number): Promise<Genre[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IGenresPaginated> = await this.httpService.axiosRef.get(url);
    const genres = response.data.items.map(this.convertGenre);

    return genres;
  };

  createGenre = async (jwt: string, data: Omit<IGenre, '_id'>): Promise<Genre | Error> => {
    try {
      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };
      const response: AxiosResponse<IGenre> = await this.httpService.axiosRef.post(this.baseUrl, data, {
        headers: headersRequest,
      });

      const genre = this.convertGenre(response.data);

      return genre;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };

  deleteGenre = async (jwt: string, id: string): Promise<string | Error> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };

      await this.checkGenreExistance(id);

      await this.httpService.axiosRef.delete(url, {
        headers: headersRequest,
      });

      return `Genre with id ${id} was successfuly deleted`;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };

  updateGenre = async (jwt: string, id: string, data: Omit<IGenre, '_id'>): Promise<Genre | Error> => {
    try {
      await this.checkGenreExistance(id);

      const url = `${this.baseUrl}/${id}`;
      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };
      const response: AxiosResponse<IGenre> = await this.httpService.axiosRef.put(url, data, {
        headers: headersRequest,
      });

      const genreUpdated = this.convertGenre(response.data);

      return genreUpdated;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };
}
