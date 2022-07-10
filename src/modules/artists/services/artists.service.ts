import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IArtist } from '../models/artist.model';
import { Artist, ArtistInput, ArtistUpdateInput } from '../../../graphql';
import { IArtistsPaginated } from '../models/artistsPaginated.model';
import BandsService from '../../bands/services/bands.service';

@Injectable()
export default class ArtistsService {
  private baseUrl = process.env.ARTISTS_URL as string;

  private readonly httpService!: HttpService;

  private readonly bandsService!: BandsService;

  constructor() {
    this.httpService = new HttpService();
    this.bandsService = new BandsService();
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
      instruments,
    };

    return convertedArtist;
  };

  private checkOneArtistExistance = async (id: string): Promise<void> => {
    const artist = await this.findOneById(id);

    if (!artist) {
      throw new Error(`Artist with id ${id} not found`);
    }
  };

  checkArtistsExistance = async (artistsIds: string[]) =>
    Promise.all(artistsIds?.map((id) => this.checkOneArtistExistance(id)));

  findOneById = async (id: string): Promise<Artist | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<IArtist> = await this.httpService.axiosRef.get(url);
      const artist = this.convertArtist(response.data);

      return artist;
    } catch {
      return null;
    }
  };

  findAll = async (limit: number, offset: number): Promise<Artist[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IArtistsPaginated> = await this.httpService.axiosRef.get(url);
    const artists = response.data.items.map(this.convertArtist);

    return artists;
  };

  private formatBirthDate = (birthDate: string | undefined | null): string | null => {
    if (!birthDate) return null;
    const date: Date = new Date(birthDate);
    const day: string = date.getDate().toString().padStart(2, '0');
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
    const year: string = date.getFullYear().toString().padStart(4, '0');

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  private updateBandsMembers = async (jwt: string, artistId: string, input: ArtistInput | ArtistUpdateInput) => {
    const bandsIds = input.bandsIds || [];

    await Promise.all(
      bandsIds.map(async (bandId) => {
        const band = await this.bandsService.findOneById(bandId as string);

        if (band) {
          const existedMembers = band?.members || [];
          const updatedMembers = [...existedMembers, { id: artistId }];
          return this.bandsService.updateBand(jwt, band.id, { members: updatedMembers });
        }
        return undefined;
      })
    );
  };

  createArtist = async (jwt: string, input: ArtistInput): Promise<Artist> => {
    const data = {
      ...input,
      birthDate: this.formatBirthDate(input.birthDate),
    };
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    const response: AxiosResponse<IArtist> = await this.httpService.axiosRef.post(this.baseUrl, data, {
      headers,
    });

    const artist = this.convertArtist(response.data);
    await this.updateBandsMembers(jwt, artist.id, input);

    return artist;
  };

  deleteArtist = async (jwt: string, id: string): Promise<string> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    await this.checkOneArtistExistance(id);

    await this.httpService.axiosRef.delete(url, {
      headers,
    });

    return `Artist with id ${id} was successfuly deleted`;
  };

  updateArtist = async (jwt: string, id: string, input: ArtistUpdateInput): Promise<Artist> => {
    await this.checkOneArtistExistance(id);

    const url = `${this.baseUrl}/${id}`;
    const data = {
      ...input,
      birthDate: this.formatBirthDate(input.birthDate),
    };
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<IArtist> = await this.httpService.axiosRef.put(url, data, {
      headers,
    });

    const artistUpdated = this.convertArtist(response.data);

    return artistUpdated;
  };
}
