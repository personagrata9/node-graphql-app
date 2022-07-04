import { IGenre } from './genre.model';

export interface IGenresPaginated {
  items: IGenre[];
  limit: number;
  offset: number;
  total: number;
}
