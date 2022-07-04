import { IAlbum } from './album.model';

export interface IAlbumsPaginated {
  items: IAlbum[];
  limit: number;
  offset: number;
  total: number;
}
