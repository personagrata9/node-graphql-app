import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Band } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import GenresService from '../../genres/services/genres.service';
import BandsService from '../services/bands.service';

@Resolver('Band')
export default class BandsResolver {
  private readonly bandsService!: BandsService;

  private readonly genresService!: GenresService;

  private readonly artistsService!: ArtistsService;

  constructor() {
    this.bandsService = new BandsService();
    this.genresService = new GenresService();
    this.artistsService = new ArtistsService();
  }

  @Query()
  async band(@Args('id') id: string): Promise<Band | null> {
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
      ? genres.map((genre) => (genre ? this.genresService.findOneById(genre.id) : null))
      : [];
    const result = (await Promise.all(promises)).filter((genre) => genre);

    return result;
  }

  @ResolveField()
  async members(@Parent() band: Band) {
    const { members } = band;
    const promises = members?.length
      ? members.map((member) => (member ? this.artistsService.findOneById(member.id) : null))
      : [];
    const artists = await Promise.all(promises);
    const result = artists
      .map((artist, index) =>
        artist
          ? {
              ...artist,
              instrument: members ? members[index]?.instrument : null,
              years: members ? members[index]?.years : null,
            }
          : null
      )
      .filter((member) => member);

    return result;
  }
}
