import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Track, TrackInput, TrackUpdateInput } from '../../../graphql';
import { ITrack } from '../models/track.model';
import { ITracksPaginated } from '../models/tracksPaginated.model';

@Injectable()
export default class TracksService {
  private baseUrl = process.env.TRACKS_URL as string;

  private readonly httpService!: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  private convertTrack = (data: ITrack): Track => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, title, albumId, artistsIds, bandsIds, duration, released, genresIds } = data;

    const convertedTrack: Track = {
      id: _id,
      title,
      album: { id: albumId },
      artists: artistsIds.map((id) => ({ id })),
      bands: bandsIds.map((id) => ({ id })),
      duration,
      released,
      genres: genresIds.map((id) => ({ id })),
    };

    return convertedTrack;
  };

  checkOneTrackExistance = async (id: string): Promise<void> => {
    const album = await this.findOneById(id);

    if (!album) {
      throw new Error(`Album with id ${id} not found`);
    }
  };

  checkAllTracksExistance = async (albumsIds: string[]) =>
    Promise.all(albumsIds?.map((id) => this.checkOneTrackExistance(id)));

  findOneById = async (id: string): Promise<Track | null> => {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response: AxiosResponse<ITrack> = await this.httpService.axiosRef.get(url);
      const track = this.convertTrack(response.data);

      return track;
    } catch (error) {
      return null;
    }
  };

  findAll = async (limit: number, offset: number): Promise<Track[]> => {
    const url = `${this.baseUrl}?limit=${limit || 0}&offset=${offset || 0}`;
    const response: AxiosResponse<ITracksPaginated> = await this.httpService.axiosRef.get(url);
    const tracks = response.data.items.map(this.convertTrack);

    return tracks;
  };

  createTrack = async (jwt: string, input: TrackInput): Promise<Track> => {
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    const response: AxiosResponse<ITrack> = await this.httpService.axiosRef.post(this.baseUrl, input, {
      headers,
    });

    const track = this.convertTrack(response.data);

    return track;
  };

  deleteTrack = async (jwt: string, id: string): Promise<string> => {
    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };

    await this.checkOneTrackExistance(id);

    await this.httpService.axiosRef.delete(url, {
      headers,
    });

    return `Track with id ${id} was successfuly deleted`;
  };

  updateTrack = async (jwt: string, id: string, input: TrackUpdateInput): Promise<Track> => {
    await this.checkOneTrackExistance(id);

    const url = `${this.baseUrl}/${id}`;
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${jwt}`,
    };
    const response: AxiosResponse<ITrack> = await this.httpService.axiosRef.put(url, input, {
      headers,
    });

    const track = this.convertTrack(response.data);

    return track;
  };
}
