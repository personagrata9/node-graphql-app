import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IBand } from '../models/band.model';
import { IBandsPaginated } from '../models/bandsPaginated.model';
import { Band, BandInput, BandUpdateInput } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import GenresService from '../../genres/services/genres.service';

@Injectable()
export default class BandsService {
  private baseUrl = process.env.BANDS_URL as string;

  private readonly httpService!: HttpService;

  private readonly artistsService!: ArtistsService;

  private readonly genresService!: GenresService;

  constructor() {
    this.httpService = new HttpService();
    this.artistsService = new ArtistsService();
    this.genresService = new GenresService();
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

  private checkInput = async (input: BandInput | BandUpdateInput): Promise<void> => {
    const { members, genresIds } = input;
    if (members?.length) {
      const artistsIds: string[] = members.map((member) => member?.id as string);
      await this.artistsService.checkArtistsExistance(artistsIds);
    }
    if (genresIds?.length) {
      await this.genresService.checkAllGenresExistance(genresIds as string[]);
    }
  };

  createBand = async (jwt: string, input: BandInput): Promise<Band | Error> => {
    try {
      await this.checkInput(input);

      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };

      const response: AxiosResponse<IBand> = await this.httpService.axiosRef.post(this.baseUrl, input, {
        headers: headersRequest,
      });

      const band = this.convertBand(response.data);

      return band;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };

  deleteBand = async (jwt: string, id: string): Promise<string | Error> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };

      await this.checkOneBandExistance(id);

      await this.httpService.axiosRef.delete(url, {
        headers: headersRequest,
      });

      return `Band with id ${id} was successfuly deleted`;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };

  updateBand = async (jwt: string, id: string, input: BandUpdateInput): Promise<Band | Error> => {
    try {
      await this.checkOneBandExistance(id);
      await this.checkInput(input);

      const url = `${this.baseUrl}/${id}`;
      const headersRequest: AxiosRequestHeaders = {
        Authorization: `Bearer ${jwt}`,
      };
      const response: AxiosResponse<IBand> = await this.httpService.axiosRef.put(url, input, {
        headers: headersRequest,
      });

      const bandUpdated = this.convertBand(response.data);

      return bandUpdated;
    } catch (error) {
      return new Error((error as Error).message);
    }
  };
}
