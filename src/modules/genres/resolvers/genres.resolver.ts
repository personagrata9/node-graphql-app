import { Args, Query, Resolver } from '@nestjs/graphql';
import { Genre } from '../../../graphql';
import GenresService from '../services/genres.service';

@Resolver('Genre')
export default class GenresResolver {
  private readonly genresService!: GenresService;

  constructor() {
    this.genresService = new GenresService();
  }

  @Query()
  async genre(@Args('id') id: string): Promise<Genre | null> {
    const genre = await this.genresService.findOneById(id);

    return genre;
  }

  @Query()
  async genres(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Genre[]> {
    const genres = await this.genresService.findAll(limit, offset);

    return genres;
  }
}
