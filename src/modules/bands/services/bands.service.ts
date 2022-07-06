import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { IBand } from '../models/band.model';
import { IBandsPaginated } from '../models/bandsPaginated.model';
import { Band } from '../../../graphql';

@Injectable()
export default class BandsService {
  private baseUrl = process.env.BANDS_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertBand = (data: IBand): Band => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, name, origin, members, website, genresIds } = data;

    const convertedBand: Band = {
      id: _id,
      name,
      origin,
      members,
      website,
      genres: genresIds.map((id) => ({ id })),
    };

    return convertedBand;
  };

  findOneById = async (id: string): Promise<Band | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<IBand> = await this.httpService.axiosRef.get(url);
      const band = this.convertBand(response.data);

      return band;
    } catch {
      return null;
    }
  };

  findAll = async (limit: number, offset: number): Promise<Band[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IBandsPaginated> = await this.httpService.axiosRef.get(url);
    const bands = response.data.items.map(this.convertBand);

    return bands;
  };
}
