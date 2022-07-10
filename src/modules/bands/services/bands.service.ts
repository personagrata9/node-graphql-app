import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IBand } from '../models/band.model';
import { IBandsPaginated } from '../models/bandsPaginated.model';
import { Band, BandInput, BandUpdateInput } from '../../../graphql';

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

  private checkOneBandExistance = async (id: string): Promise<void> => {
    const band = await this.findOneById(id);

    if (!band) {
      throw new Error(`Band with id ${id} not found`);
    }
  };

  checkAllBandsExistance = async (bandsIds: string[]) =>
    Promise.all(bandsIds?.map((id) => this.checkOneBandExistance(id)));

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

  createBand = async (jwt: string, input: BandInput): Promise<Band> => {
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    const response: AxiosResponse<IBand> = await this.httpService.axiosRef.post(this.baseUrl, input, {
      headers,
    });

    const band = this.convertBand(response.data);

    return band;
  };

  deleteBand = async (jwt: string, id: string): Promise<string> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    await this.checkOneBandExistance(id);

    await this.httpService.axiosRef.delete(url, {
      headers,
    });

    return `Band with id ${id} was successfuly deleted`;
  };

  updateBand = async (jwt: string, id: string, input: BandUpdateInput): Promise<Band> => {
    await this.checkOneBandExistance(id);

    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<IBand> = await this.httpService.axiosRef.put(url, input, {
      headers,
    });

    const band = this.convertBand(response.data);

    return band;
  };
}
