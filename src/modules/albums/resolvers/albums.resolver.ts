import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Album, AlbumInput, AlbumUpdateInput } from '../../../graphql';
import ArtistsService from '../../artists/services/artists.service';
import BandsService from '../../bands/services/bands.service';
import { IContext } from '../../context.model';
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

  private checkInput = async (input: AlbumInput | AlbumUpdateInput): Promise<void> => {
    const { artistsIds, bandsIds, trackIds, genresIds } = input;

    if (artistsIds?.length) {
      await this.artistsService.checkAllArtistsExistance(artistsIds as string[]);
    }

    if (bandsIds?.length) {
      await this.bandsService.checkAllBandsExistance(bandsIds as string[]);
    }

    if (trackIds?.length) {
      await this.tracksService.checkAllTracksExistance(trackIds as string[]);
    }

    if (genresIds?.length) {
      await this.genresService.checkAllGenresExistance(genresIds as string[]);
    }
  };

  @Mutation()
  async createAlbum(@Context() context: IContext, @Args('input') input: AlbumInput): Promise<Album | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;

      const { trackIds } = input;

      if (trackIds?.length) {
        await Promise.all(
          trackIds.map(async (trackId) => {
            const previousTrack = await this.tracksService.findOneById(trackId as string);
            const previousTrackAlbum = await this.albumsService.findOneById(previousTrack?.album?.id as string);
            const previousTrackIds = previousTrackAlbum?.tracks?.map((item) => item?.id || null) || [];
            previousTrackIds.splice(
              trackIds.findIndex((item) => item === trackId),
              1
            );

            if (previousTrackAlbum)
              return this.albumsService.updateAlbum(jwt as string, previousTrackAlbum?.id, {
                trackIds: previousTrackIds,
              });

            return undefined;
          })
        );
      }

      const album = await this.albumsService.createAlbum(jwt as string, input);

      if (trackIds?.length) {
        await Promise.all(
          trackIds.map((trackId) =>
            this.tracksService.updateTrack(jwt as string, trackId as string, { albumId: album.id })
          )
        );
      }

      return album;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async deleteAlbum(@Context() context: IContext, @Args('id') id: string): Promise<string | Error> {
    try {
      const { jwt } = context.req.headers;

      const message = await this.albumsService.deleteAlbum(jwt as string, id);

      return message;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async updateAlbum(
    @Context() context: IContext,
    @Args('id') id: string,
    @Args('input') input: AlbumUpdateInput
  ): Promise<Album | Error> {
    try {
      await this.albumsService.checkOneAlbumExistance(id);
      await this.checkInput(input);

      const { jwt } = context.req.headers;

      const previousAlbum = await this.albumsService.findOneById(id);
      const previousTracksIds = previousAlbum?.tracks?.map((track) => track?.id);
      const currentTracksIds = input.trackIds;

      if (previousTracksIds?.length) {
        await Promise.all(
          previousTracksIds.map(async (trackId) => {
            if (trackId && !currentTracksIds?.includes(trackId)) {
              const previousTrack = await this.tracksService.findOneById(trackId);
              const previousTrackAlbum = await this.albumsService.findOneById(previousTrack?.album?.id as string);
              const trackIds = previousTrackAlbum?.tracks?.map((item) => item?.id || null) || [];
              trackIds.splice(
                trackIds.findIndex((item) => item === trackId),
                1
              );

              if (previousTrackAlbum?.id)
                await this.albumsService.updateAlbum(jwt as string, previousTrackAlbum?.id, { trackIds });

              return this.tracksService.updateTrack(jwt as string, trackId, { albumId: null });
            }

            return undefined;
          })
        );
      }

      if (currentTracksIds?.length) {
        await Promise.all(
          currentTracksIds.map(async (trackId) => {
            if (trackId) {
              const previousTrack = await this.tracksService.findOneById(trackId);
              const previousTrackAlbum = await this.albumsService.findOneById(previousTrack?.album?.id as string);
              const trackIds = previousTrackAlbum?.tracks?.map((item) => item?.id || null) || [];
              trackIds.splice(
                trackIds.findIndex((item) => item === trackId),
                1
              );

              if (previousTrackAlbum?.id)
                await this.albumsService.updateAlbum(jwt as string, previousTrackAlbum?.id, { trackIds });
              return this.tracksService.updateTrack(jwt as string, trackId, { albumId: id });
            }

            return undefined;
          })
        );
      }

      const album = await this.albumsService.updateAlbum(jwt as string, id, input);

      return album;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }
}
