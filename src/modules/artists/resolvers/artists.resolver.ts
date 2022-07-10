import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Artist, ArtistInput, ArtistUpdateInput } from '../../../graphql';
import ArtistsService from '../services/artists.service';
import BandsService from '../../bands/services/bands.service';
import { IContext } from '../../context.model';

@Resolver('Artist')
export default class ArtistsResolver {
  private readonly artistsService!: ArtistsService;

  private readonly bandsService!: BandsService;

  constructor() {
    this.artistsService = new ArtistsService();
    this.bandsService = new BandsService();
  }

  private checkInput = async (input: ArtistInput | ArtistUpdateInput): Promise<void> => {
    const { bandsIds } = input;
    if (bandsIds?.length) {
      await this.bandsService.checkAllBandsExistance(bandsIds as string[]);
    }
  };

  @Query()
  async artist(@Args('id') id: string): Promise<Artist | null> {
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
    const result = (await Promise.all(promises)).filter((band) => band);

    return result;
  }

  @Mutation()
  async createArtist(@Context() context: IContext, @Args('input') input: ArtistInput): Promise<Artist | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;
      const artist = await this.artistsService.createArtist(jwt as string, input);

      return artist;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async deleteArtist(@Context() context: IContext, @Args('id') id: string): Promise<string | Error> {
    try {
      const { jwt } = context.req.headers;

      const message = await this.artistsService.deleteArtist(jwt as string, id);

      return message;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async updateArtist(
    @Context() context: IContext,
    @Args('id') id: string,
    @Args('input') input: ArtistUpdateInput
  ): Promise<Artist | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;
      const band = await this.artistsService.updateArtist(jwt as string, id, input);

      return band;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }
}
