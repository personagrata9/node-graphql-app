import { IBand } from './band.model';

export interface IBandsPaginated {
  items: IBand[];
  limit: number;
  offset: number;
  total: number;
}
