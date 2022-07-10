import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Band, BandInput, BandUpdateInput } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import { IContext } from '../../context.model';
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

  private checkInput = async (input: BandInput | BandUpdateInput): Promise<void> => {
    const { members, genresIds } = input;

    if (members?.length) {
      const artistsIds: string[] = members.map((member) => member?.id as string);
      await this.artistsService.checkAllArtistsExistance(artistsIds);
    }

    if (genresIds?.length) {
      await this.genresService.checkAllGenresExistance(genresIds as string[]);
    }
  };

  @Mutation()
  async createBand(@Context() context: IContext, @Args('input') input: BandInput): Promise<Band | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;
      const band = await this.bandsService.createBand(jwt as string, input);

      return band;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async deleteBand(@Context() context: IContext, @Args('id') id: string): Promise<string | Error> {
    try {
      const { jwt } = context.req.headers;

      const message = await this.bandsService.deleteBand(jwt as string, id);

      return message;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async updateBand(
    @Context() context: IContext,
    @Args('id') id: string,
    @Args('input') input: BandUpdateInput
  ): Promise<Band | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;
      const band = await this.bandsService.updateBand(jwt as string, id, input);

      return band;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }
}
