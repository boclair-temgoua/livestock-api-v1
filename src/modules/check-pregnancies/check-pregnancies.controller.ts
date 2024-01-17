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

import { CheckPregnanciesService } from './check-pregnancies.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateCheckPregnanciesDto } from './check-pregnancies.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';
import { BreedingsService } from '../breedings/breedings.service';

@Controller('check-pregnancies')
export class CheckPregnanciesController {
  constructor(
    private readonly checkPregnanciesService: CheckPregnanciesService,
    private readonly breedingsService: BreedingsService,
  ) {}

  /** Get all CheckPregnancies */
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

    const CheckPregnancies = await this.checkPregnanciesService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: CheckPregnancies });
  }

  /** Post one CheckPregnancies */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
  ) {
    const { user } = req;
    const { date, note, farrowingDate, method, result, breedingId } = body;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
    });

    if (!findOneBreeding)
      throw new HttpException(
        `${findOneBreeding.animalId} isn't eligible for check please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.createOne({
      date,
      note,
      farrowingDate,
      method,
      result,
      breedingId: findOneBreeding.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({
      res,
      results: [HttpStatus.CREATED, 'CheckPregnancy Created', checkPregnancy],
    });
  }

  /** Update one CheckPregnancy */
  @Put(`/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const { date, note, farrowingDate, method, result, breedingId } = body;
    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
    });

    if (!checkPregnancyId)
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (!findOneBreeding)
      throw new HttpException(
        `${findOneBreeding.animalId} isn't eligible for check please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId: findOneBreeding.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({
      res,
      results: [
        HttpStatus.CREATED,
        'CheckPregnancy Updated Successfully',
        checkPregnancy,
      ],
    });
  }

  /** Get one CheckPregnancy */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    if (!checkPregnancyId)
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
    });

    return reply({ res, results: [HttpStatus.CREATED, checkPregnancy] });
  }

  /** Delete one CheckPregnancy */
  @Delete(`/delete/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    if (!checkPregnancyId)
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: [HttpStatus.ACCEPTED, checkPregnancy] });
  }
}
