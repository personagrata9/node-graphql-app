import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
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
      year: +year,
    };

    return convertedGenre;
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
}
