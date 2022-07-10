import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IGenre } from '../models/genre.model';
import { IGenresPaginated } from '../models/genresPaginated.model';
import { Genre, GenreInput, GenreUpdateInput } from '../../../graphql';

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

  private checkOneGenreExistance = async (id: string): Promise<void> => {
    const genre = await this.findOneById(id);

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }
  };

  checkAllGenresExistance = async (genresIds: string[]) =>
    Promise.all(genresIds?.map((id) => this.checkOneGenreExistance(id)));

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

  createGenre = async (jwt: string, input: GenreInput): Promise<Genre | Error> => {
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<IGenre> = await this.httpService.axiosRef.post(this.baseUrl, input, {
      headers,
    });

    const genre = this.convertGenre(response.data);

    return genre;
  };

  deleteGenre = async (jwt: string, id: string): Promise<string> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    await this.checkOneGenreExistance(id);

    await this.httpService.axiosRef.delete(url, {
      headers,
    });

    return `Genre with id ${id} was successfuly deleted`;
  };

  updateGenre = async (jwt: string, id: string, input: GenreUpdateInput): Promise<Genre> => {
    await this.checkOneGenreExistance(id);

    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<IGenre> = await this.httpService.axiosRef.put(url, input, {
      headers,
    });

    const genreUpdated = this.convertGenre(response.data);

    return genreUpdated;
  };
}
