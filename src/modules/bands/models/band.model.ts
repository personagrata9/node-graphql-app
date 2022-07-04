import { Member } from '../../../graphql';

export interface IBand {
  _id: string;
  name: string;
  origin: string;
  members: Member[];
  website: string;
  genresIds: string[];
}
