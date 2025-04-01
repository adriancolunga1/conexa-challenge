import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dtos';
import { Movie } from '../../common/entities';
import { AuthApi, Roles } from '../../common/guards';
import { unauthorizedResponse } from '../../common/api-unauthorized-response';

@Controller('movies')
@ApiTags('movies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Request',
  example: unauthorizedResponse,
})
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOkResponse({ description: 'OK', type: Movie, isArray: true })
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @AuthApi(Roles.STANDARD)
  @ApiOkResponse({ description: 'OK', type: Movie })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  @Post()
  @AuthApi(Roles.ADMIN)
  @ApiOkResponse({ description: 'OK', type: Movie })
  create(@Body() dto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(dto);
  }

  @Post('syncronize')
  @AuthApi(Roles.ADMIN)
  @ApiOkResponse({ description: 'OK', type: Movie, isArray: true })
  syncronize(): Promise<Movie[]> {
    return this.moviesService.syncronize();
  }

  @Patch(':id')
  @AuthApi(Roles.ADMIN)
  @ApiOkResponse({ description: 'OK', type: Movie })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, dto);
  }

  @Delete(':id')
  @AuthApi(Roles.ADMIN)
  @ApiOkResponse({ description: 'OK', example: 'Done' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.moviesService.remove(id);
  }
}
