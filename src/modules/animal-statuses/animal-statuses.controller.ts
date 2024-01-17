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
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { AnimalStatusesService } from './animal-statuses.service';
import { CreateOrUpdateAnimalStatusesDto } from './animal-statuses.dto';
import { JwtAuthGuard } from '../users/middleware';

@Controller('animal-statuses')
export class AnimalStatusesController {
  constructor(private readonly animalStatusesService: AnimalStatusesService) {}

  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(@Res() res) {
    const animalStatus = await this.animalStatusesService.findAll();

    return reply({ res, results: [HttpStatus.OK, animalStatus] });
  }

  /** Post one Animal status */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalStatusesDto,
  ) {
    const { title, color } = body;
    const animalStatus = await this.animalStatusesService.createOne({
      title,
      color,
    });

    return reply({
      res,
      results: [
        HttpStatus.CREATED,
        'Animal status Created successfully',
        animalStatus,
      ],
    });
  }

  /** Update one animal status */
  @Put(`/:animalstatusId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalStatusesDto,
    @Param('animalstatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    const { title, color } = body;

    if (!animalStatusId)
      throw new HttpException(
        `${animalStatusId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const animalStatus = await this.animalStatusesService.updateOne(
      { animalStatusId },
      {
        title,
        color,
      },
    );

    return reply({
      res,
      results: [
        HttpStatus.ACCEPTED,
        'Animal Status Updated successfully',
        animalStatus,
      ],
    });
  }

  /** Get one animal status */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('animalstatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    if (!animalStatusId)
      throw new HttpException(
        `${animalStatusId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const animalStatus = await this.animalStatusesService.findOneBy({
      animalStatusId,
    });

    return reply({ res, results: [HttpStatus.ACCEPTED, animalStatus] });
  }

  /** Delete animal status*/
  @Delete(`/delete/:animalstatusId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('animalstatusId', ParseUUIDPipe) animalStatusId: string,
  ) {
    if (!animalStatusId)
      throw new HttpException(
        `${animalStatusId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const animalStatus = await this.animalStatusesService.updateOne(
      { animalStatusId },
      { deletedAt: new Date() },
    );

    return reply({
      res,
      results: [
        HttpStatus.ACCEPTED,
        'Animal Status Deleted successfully',
        animalStatus,
      ],
    });
  }
}
