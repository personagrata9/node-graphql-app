import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Album, Track } from '../../../graphql';
import AlbumsService from '../../albums/services/albums.service';
import ArtistsService from '../../artists/services/artists.service';
import BandsService from '../../bands/services/bands.service';
import GenresService from '../../genres/services/genres.service';
import TracksService from '../services/tracks.service';

@Resolver('Track')
export default class TracksResolver {
  private readonly tracksService!: TracksService;

  private readonly albumsService!: AlbumsService;

  private readonly artistsService!: ArtistsService;

  private readonly bandsService!: BandsService;

  private readonly genresService!: GenresService;

  constructor() {
    this.tracksService = new TracksService();
    this.albumsService = new AlbumsService();
    this.artistsService = new ArtistsService();
    this.bandsService = new BandsService();
    this.genresService = new GenresService();
  }

  @Query()
  async track(@Args('id') id: string): Promise<Track | null> {
    const album = await this.tracksService.findOneById(id);

    return album;
  }

  @Query()
  async tracks(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Track[]> {
    const albums = await this.tracksService.findAll(limit, offset);

    return albums;
  }

  @ResolveField()
  async album(@Parent() track: Track) {
    const { album } = track;
    const { id } = album as Album;
    const result = await this.albumsService.findOneById(id);

    return result;
  }

  @ResolveField()
  async artists(@Parent() track: Track) {
    const { artists } = track;
    const promises = artists?.length
      ? artists.map((artist) => (artist ? this.artistsService.findOneById(artist.id) : null))
      : [];
    const result = (await Promise.all(promises)).filter((artist) => artist);

    return result;
  }

  @ResolveField()
  async bands(@Parent() track: Track) {
    const { bands } = track;
    const promises = bands?.length ? bands.map((band) => (band ? this.bandsService.findOneById(band.id) : null)) : [];
    const result = (await Promise.all(promises)).filter((band) => band);

    return result;
  }

  @ResolveField()
  async genres(@Parent() track: Track) {
    const { genres } = track;
    const promises = genres?.length
      ? genres.map((genre) => (genre ? this.genresService.findOneById(genre.id) : null))
      : [];
    const result = await Promise.all(promises);

    return result;
  }
}
