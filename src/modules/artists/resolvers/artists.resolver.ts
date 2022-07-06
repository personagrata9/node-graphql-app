import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Artist } from '../../../graphql';
import ArtistsService from '../services/artists.service';
import BandsService from '../../bands/services/bands.service';

@Resolver('Artist')
export default class ArtistsResolver {
  private readonly artistsService!: ArtistsService;

  private readonly bandsService!: BandsService;

  constructor() {
    this.artistsService = new ArtistsService();
    this.bandsService = new BandsService();
  }

  @Query()
  async artist(@Args('id') id: string): Promise<Artist> {
    const artist = await this.artistsService.findOneById(id);

    return artist;
  }

  @Query()
  async artists(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Artist[]> {
    const artists = await this.artistsService.findAll(limit, offset);

    return artists;
  }

  @ResolveField()
  async bands(@Parent() artist: Artist) {
    const { bands } = artist;
    const promises = bands?.length ? bands.map((band) => (band ? this.bandsService.findOneById(band.id) : null)) : [];
    const result = (await Promise.all(promises)).filter((band) => band?.id);

    return result;
  }
}
