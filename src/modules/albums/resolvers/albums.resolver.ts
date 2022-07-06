import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Album } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import BandsService from '../../bands/services/bands.service';
import GenresService from '../../genres/services/genres.service';
import AlbumsService from '../services/albums.service';

@Resolver('Album')
export default class AlbumsResolver {
  private readonly albumsServise!: AlbumsService;

  private readonly artistsService!: ArtistsService;

  private readonly bandsService!: BandsService;

  // private readonly tracksServise!: TracksServise;

  private readonly genresService!: GenresService;

  constructor() {
    this.albumsServise = new AlbumsService();
    this.artistsService = new ArtistsService();
    this.bandsService = new BandsService();
    // this.tracksServise = new TracksServise();
    this.genresService = new GenresService();
  }

  @Query()
  async album(@Args('id') id: string): Promise<Album> {
    const album = await this.albumsServise.findOneById(id);

    return album;
  }

  @Query()
  async albums(@Args('limit') limit: number, @Args('offset') offset: number): Promise<Album[]> {
    const albums = await this.albumsServise.findAll(limit, offset);

    return albums;
  }

  @ResolveField()
  async artists(@Parent() album: Album) {
    const { artists } = album;
    const promises = artists?.length
      ? artists.map((artist) => (artist ? this.artistsService.findOneById(artist.id) : null))
      : [];
    const result = (await Promise.all(promises)).filter((artist) => artist?.id);

    return result;
  }

  @ResolveField()
  async bands(@Parent() album: Album) {
    const { bands } = album;
    const promises = bands?.length ? bands.map((band) => (band ? this.bandsService.findOneById(band.id) : null)) : [];
    const result = (await Promise.all(promises)).filter((band) => band?.id);

    return result;
  }

  // @ResolveField()
  // async tracks(@Parent() album: Album) {
  //   const { tracks } = album;
  //   const promises = tracks?.length
  //     ? tracks.map((track) => (track ? this.tracksService.findOneById(track.id) : null))
  //     : [];
  //   const result = (await Promise.all(promises)).filter((track) => track?.id);;

  //   return result;
  // }

  @ResolveField()
  async genres(@Parent() album: Album) {
    const { genres } = album;
    const promises = genres?.length
      ? genres.map((genre) => (genre ? this.genresService.findOneById(genre.id) : null))
      : [];
    const result = (await Promise.all(promises)).filter((genre) => genre?.id);

    return result;
  }
}
