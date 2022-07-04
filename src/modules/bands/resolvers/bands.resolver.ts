import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Band } from '../../../graphql';
import GenresService from '../../genres/services/genres.service';
import BandsService from '../services/bands.service';

@Resolver('Band')
export default class BandsResolver {
  private readonly bandsService!: BandsService;

  private readonly genreService!: GenresService;

  constructor() {
    this.bandsService = new BandsService();
    this.genreService = new GenresService();
  }

  @Query()
  async band(@Args('id') id: string): Promise<Band> {
    const band = await this.bandsService.findOneById(id);

    return band;
  }

  @Query()
  async bands(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Band[]> {
    const bands = await this.bandsService.findAll(limit, offset);

    return bands;
  }

  @ResolveField()
  async genres(@Parent() band: Band) {
    const { genres } = band;
    const promises = genres?.length
      ? genres.map((genre) => (genre ? this.genreService.findOneById(genre.id) : null))
      : [];
    const result = await Promise.all(promises);

    return result;
  }

  @ResolveField()
  async members(@Parent() band: Band) {
    const { members } = band;

    return members;
  }
}
