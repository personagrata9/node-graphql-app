import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { IAlbum } from '../models/album.model';
import { Album, AlbumInput, AlbumUpdateInput } from '../../../graphql';
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

  checkOneAlbumExistance = async (id: string): Promise<void> => {
    const album = await this.findOneById(id);

    if (!album) {
      throw new Error(`Album with id ${id} not found`);
    }
  };

  findOneById = async (id: string): Promise<Album | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<IAlbum> = await this.httpService.axiosRef.get(url);
      const album = this.convertAlbum(response.data);

      return album;
    } catch {
      return null;
    }
  };

  findAll = async (limit: number, offset: number): Promise<Album[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<IAlbumsPaginated> = await this.httpService.axiosRef.get(url);
    const albums = response.data.items.map(this.convertAlbum);

    return albums;
  };

  createAlbum = async (jwt: string, input: AlbumInput): Promise<Album> => {
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    const response: AxiosResponse<IAlbum> = await this.httpService.axiosRef.post(this.baseUrl, input, {
      headers,
    });

    const album = this.convertAlbum(response.data);

    return album;
  };

  deleteAlbum = async (jwt: string, id: string): Promise<string> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    await this.checkOneAlbumExistance(id);

    await this.httpService.axiosRef.delete(url, {
      headers,
    });

    return `Album with id ${id} was successfuly deleted`;
  };

  updateAlbum = async (jwt: string, id: string, input: AlbumUpdateInput): Promise<Album> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<IAlbum> = await this.httpService.axiosRef.put(url, input, {
      headers,
    });

    const album = this.convertAlbum(response.data);

    return album;
  };
}
