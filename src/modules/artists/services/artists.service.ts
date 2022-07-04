import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { IArtist } from '../models/artist.model';
import { Artist } from '../../../graphql';
import { IArtistsPaginated } from '../models/artistsPaginated.model';

@Injectable()
export default class ArtistsService {
  private baseUrl = process.env.ARTISTS_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertArtist = (data: IArtist): Artist => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, firstName, secondName, middleName, birthDate, birthPlace, country, bandsIds, instruments } = data;

    const convertedArtist: Artist = {
      id: _id,
      firstName,
      secondName,
      middleName,
      birthDate,
      birthPlace,
      country,
      bands: bandsIds.map((id) => ({ id })),
      instruments: instruments.join(''),
    };

    return convertedArtist;
  };

  findOneById = async (id: string): Promise<Artist> => {
    const url = `${this.baseUrl}/${id}`;
    const response: AxiosResponse<IArtist> = await this.httpService.axiosRef.get(url);
    const artist = this.convertArtist(response.data);

    return artist;
  };

  findAll = async (limit: number, offset: number): Promise<Artist[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IArtistsPaginated> = await this.httpService.axiosRef.get(url);
    const artists = response.data.items.map(this.convertArtist);

    return artists;
  };
}
