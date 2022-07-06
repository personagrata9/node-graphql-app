import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Album } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import BandsService from '../../bands/services/bands.service';
import GenresService from '../../genres/services/genres.service';
import TracksService from '../../tracks/services/tracks.service';
import AlbumsService from '../services/albums.service';

@Resolver('Album')
export default class AlbumsResolver {
  private readonly albumsService!: AlbumsService;

  private readonly artistsService!: ArtistsService;

  private readonly bandsService!: BandsService;

  private readonly tracksService!: TracksService;

  private readonly genresService!: GenresService;

  constructor() {
    this.albumsService = new AlbumsService();
    this.artistsService = new ArtistsService();
    this.bandsService = new BandsService();
    this.tracksService = new TracksService();
    this.genresService = new GenresService();
  }

  @Query()
  async album(@Args('id') id: string): Promise<Album | null> {
    const album = await this.albumsService.findOneById(id);

    return album;
  }

  @Query()
  async albums(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Album[]> {
    const albums = await this.albumsService.findAll(limit, offset);

    return albums;
  }

  @ResolveField()
  async artists(@Parent() album: Album) {
    const { artists } = album;
    const promises = artists?.length
      ? artists.map((artist) => (artist ? this.artistsService.findOneById(artist.id) : null))
      : [];
    const result = (await Promise.all(promises)).filter((artist) => artist);

    return result;
  }

  @ResolveField()
  async bands(@Parent() album: Album) {
    const { bands } = album;
    const promises = bands?.length ? bands.map((band) => (band ? this.bandsService.findOneById(band.id) : null)) : [];
    const result = (await Promise.all(promises)).filter((band) => band);

    return result;
  }

  @ResolveField()
  async tracks(@Parent() album: Album) {
    const { tracks } = album;
    const promises = tracks?.length
      ? tracks.map((track) => (track ? this.tracksService.findOneById(track.id) : null))
      : [];
    const result = await Promise.all(promises);

    return result;
  }

  @ResolveField()
  async genres(@Parent() album: Album) {
    const { genres } = album;
    const promises = genres?.length
      ? genres.map((genre) => (genre ? this.genresService.findOneById(genre.id) : null))
      : [];
    const result = await Promise.all(promises);

    return result;
  }
}
