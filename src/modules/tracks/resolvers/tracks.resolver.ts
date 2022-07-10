import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Album, Track, TrackInput, TrackUpdateInput } from '../../../graphql';
import AlbumsService from '../../albums/services/albums.service';
import ArtistsService from '../../artists/services/artists.service';
import BandsService from '../../bands/services/bands.service';
import { IContext } from '../../context.model';
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

  private checkInput = async (input: TrackInput | TrackUpdateInput): Promise<void> => {
    const { albumId, bandsIds, artistsIds, genresIds } = input;

    if (albumId) {
      await this.albumsService.checkOneAlbumExistance(albumId);
    }

    if (bandsIds?.length) {
      await this.bandsService.checkAllBandsExistance(bandsIds as string[]);
    }

    if (artistsIds?.length) {
      await this.artistsService.checkAllArtistsExistance(artistsIds as string[]);
    }

    if (genresIds?.length) {
      await this.genresService.checkAllGenresExistance(genresIds as string[]);
    }
  };

  // private updateTrackAlbum = async (jwt: string, trackId: string, input: TrackInput | TrackUpdateInput) => {
  //   const { albumId } = input;

  //   if (albumId) {
  //     const album = await this.albumsService.findOneById(albumId);

  //     if (album) {
  //       const existedTracks = album.tracks || [];
  //       if (!existedTracks.find((track) => track?.id === trackId)) {
  //         const trackIds = [...existedTracks.map((track) => track?.id || null), trackId];
  //         return this.albumsService.updateAlbum(jwt, albumId, { trackIds });
  //       }
  //     }
  //   } else {
  //     const previousTrack = await this.tracksService.findOneById(trackId);
  //   }

  //   return undefined;
  // };

  @Mutation()
  async createTrack(@Context() context: IContext, @Args('input') input: TrackInput): Promise<Album | Error> {
    try {
      await this.checkInput(input);

      const { jwt } = context.req.headers;
      const track = await this.tracksService.createTrack(jwt as string, input);

      const { albumId } = input;
      if (albumId) {
        const album = await this.albumsService.findOneById(albumId);

        if (album) {
          const existedTracksIds = album.tracks?.map((item) => item?.id || null) || [];
          const trackIds = [...existedTracksIds, track.id];

          return await this.albumsService.updateAlbum(jwt as string, albumId, { trackIds });
        }
      }

      return track;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async deleteTrack(@Context() context: IContext, @Args('id') id: string): Promise<string | Error> {
    try {
      const { jwt } = context.req.headers;

      const message = await this.tracksService.deleteTrack(jwt as string, id);

      return message;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }

  @Mutation()
  async updateTrack(
    @Context() context: IContext,
    @Args('id') id: string,
    @Args('input') input: TrackUpdateInput
  ): Promise<Track | Error> {
    try {
      await this.tracksService.checkOneTrackExistance(id);
      await this.checkInput(input);

      const { jwt } = context.req.headers;

      const previousTrack = await this.tracksService.findOneById(id);
      const previousAlbumId = previousTrack?.album?.id;
      const currentAlbumId = input.albumId;

      if (previousAlbumId && previousAlbumId !== currentAlbumId) {
        const previousAlbum = await this.albumsService.findOneById(previousAlbumId);
        const previousTracksIds = previousAlbum?.tracks?.map((item) => item?.id as string) || [];
        previousTracksIds?.splice(
          previousTracksIds.findIndex((item) => item === id),
          1
        );
        await this.albumsService.updateAlbum(jwt as string, previousAlbumId, { trackIds: previousTracksIds });
      }

      if (currentAlbumId) {
        const currentAlbum = await this.albumsService.findOneById(currentAlbumId);
        const previousTracksIds = currentAlbum?.tracks?.map((item) => item?.id as string) || [];

        const trackIds = [...previousTracksIds, id];
        await this.albumsService.updateAlbum(jwt as string, currentAlbumId, { trackIds });
      }

      const track = await this.tracksService.updateTrack(jwt as string, id, input);

      return track;
    } catch (error) {
      return new Error((error as Error).message);
    }
  }
}
