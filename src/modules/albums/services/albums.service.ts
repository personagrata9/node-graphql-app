import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { IAlbum } from '../models/album.model';
import { Album } from '../../../graphql';
import { IAlbumsPaginated } from '../models/albumsPaginated.model';

@Injectable()
export default class AlbumsService {
  private baseUrl = process.env.ALBUMS_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertAlbum = (data: IAlbum): Album => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, name, released, artistsIds, bandsIds, trackIds, genresIds, image } = data;

    const convertedArtist: Album = {
      id: _id,
      name,
      released,
      artists: artistsIds.map((id) => ({ id })),
      bands: bandsIds.map((id) => ({ id })),
      tracks: trackIds.map((id) => ({ id, title: '' })),
      genres: genresIds.map((id) => ({ id })),
      image,
    };

    return convertedArtist;
  };

  findOneById = async (id: string): Promise<Album> => {
    const url = `${this.baseUrl}/${id}`;
    const response: AxiosResponse<IAlbum> = await this.httpService.axiosRef.get(url);
    const album = this.convertAlbum(response.data);

    return album;
  };

  findAll = async (limit: number, offset: number): Promise<Album[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IAlbumsPaginated> = await this.httpService.axiosRef.get(url);
    const albums = response.data.items.map(this.convertAlbum);

    return albums;
  };
}
