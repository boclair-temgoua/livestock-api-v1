import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateContactUsDto } from './contact-us.dto';
import { ContactUsService } from './contact-us.service';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  /** Get all Contacts */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
  ) {
    const { search } = searchQuery;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const contactUs = await this.contactUsService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: contactUs });
  }

  /** Post one Contact */
  @Post(`/`)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() createOrUpdateContactUsDto: CreateOrUpdateContactUsDto,
  ) {
    const { subject, fullName, phone, email, description } =
      createOrUpdateContactUsDto;

    const contactUs = await this.contactUsService.createOne({
      subject,
      fullName,
      phone,
      email,
      description,
    });

    return reply({ res, results: contactUs });
  }

  /** Get one Contact */
  @Get(`/show/:contactId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    const user = await this.contactUsService.findOneBy({ contactId });

    return reply({ res, results: user });
  }

  /** Delete one Contact */
  @Delete(`/delete/:contactId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    const { user } = req;
    const fineOnecontributor = await this.contactUsService.findOneBy({
      contactId,
      organizationId: user?.organizationId,
    });
    if (!fineOnecontributor)
      throw new HttpException(
        `ContributorId: ${contactId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const contactUs = await this.contactUsService.updateOne(
      { contactId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: contactUs });
  }
}
