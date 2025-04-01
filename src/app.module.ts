import { Module } from '@nestjs/common';
import { AuthStrategy, RefreshStrategy } from 'src/common/strategies';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IEnvs } from 'src/common/interfaces';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'src/winston.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionsFilter } from 'src/common/exceptions/all.exception';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { MoviesModule } from './modules/movies/movies.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvs>) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    MoviesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    AuthStrategy,
    RefreshStrategy,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
