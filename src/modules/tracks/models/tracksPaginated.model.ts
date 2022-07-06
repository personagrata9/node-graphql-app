import { ITrack } from './track.model';

export interface ITracksPaginated {
  items: ITrack[];
  limit: number;
  offset: number;
  total: number;
}
