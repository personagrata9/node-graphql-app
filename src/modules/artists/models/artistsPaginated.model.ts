import { IArtist } from './artist.model';

export interface IArtistsPaginated {
  items: IArtist[];
  limit: number;
  offset: number;
  total: number;
}
