import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { BreedingsService } from './breedings.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateBreedingsDto } from './breedings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';
import { AnimalsService } from '../animals/animals.service';

@Controller('breedings')
export class BreedingsController {
  constructor(
    private readonly breedingsService: BreedingsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all Breedings */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const breedings = await this.breedingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: [HttpStatus.OK, breedings] });
  }

  /** Post one Breeding */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
  ) {
    const { user } = req;
    const { date, note, method, animalId } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
    });

    if (!findOneAnimal)
      throw new HttpException(
        `Animal number:${findOneAnimal.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breeding = await this.breedingsService.createOne({
      date,
      note,
      method,
      animalId: findOneAnimal.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({
      res,
      results: [HttpStatus.CREATED, 'Breeding Created successfully', breeding],
    });
  }

  /** Update one Breeding */
  @Put(`/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { date, note, method, animalId } = body;

    if (!breedingId)
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
    });

    const breeding = await this.breedingsService.updateOne(
      { breedingId },
      {
        date,
        note,
        method,
        animalId: findOneAnimal.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({
      res,
      results: [HttpStatus.ACCEPTED, 'Breeding Updated successfully', breeding],
    });
  }

  /** Get one Breeding */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    if (!breedingId)
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const breeding = await this.breedingsService.findOneBy({
      breedingId,
    });

    return reply({ res, results: [HttpStatus.ACCEPTED, breeding] });
  }

  /** Delete one Breedings */
  @Delete(`/delete/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    if (!breedingId)
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const breeding = await this.breedingsService.updateOne(
      { breedingId },
      { deletedAt: new Date() },
    );

    return reply({
      res,
      results: [HttpStatus.ACCEPTED, 'Breeding Deleted successfully', breeding],
    });
  }
}
