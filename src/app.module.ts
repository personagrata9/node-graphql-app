import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import UsersModule from './modules/users/users.module';
import GenresModule from './modules/genres/genres.module';
import BandsModule from './modules/bands/bands.module';
import ArtistsModule from './modules/artists/artists.module';
import AlbumsModule from './modules/albums/albums.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
    UsersModule,
    GenresModule,
    BandsModule,
    ArtistsModule,
    AlbumsModule,
  ],
})
export default class AppModule {}
