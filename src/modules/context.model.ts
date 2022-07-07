import { AxiosRequestHeaders } from 'axios';

export interface IContext {
  req: IRequest;
}

interface IRequest {
  headers: AxiosRequestHeaders;
}
