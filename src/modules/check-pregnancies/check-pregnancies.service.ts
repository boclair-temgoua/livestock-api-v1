import { Injectable } from '@nestjs/common';
import {
  CreateCheckPregnanciesOptions,
  GetCheckPregnanciesSelections,
  GetOneCheckPregnanciesSelections,
  UpdateCheckPregnanciesOptions,
  UpdateCheckPregnanciesSelections,
  CheckPregnancySelect,
} from './check-pregnancies.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { CheckPregnancy, Prisma } from '@prisma/client';

@Injectable()
export class CheckPregnanciesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCheckPregnanciesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.CheckPregnancyWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            note: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const checkPregnancies = await this.client.checkPregnancy.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: CheckPregnancySelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.checkPregnancy.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: checkPregnancies,
    });
  }

  /** Find one CheckPregnancies to the database. */
  async findOneBy(selections: GetOneCheckPregnanciesSelections) {
    const { checkPregnancyId } = selections;
    const checkPregnancy = await this.client.checkPregnancy.findUnique({
      select: CheckPregnancySelect,
      where: {
        id: checkPregnancyId,
      },
    });

    return checkPregnancy;
  }

  /** Create one CheckPregnancies to the database. */
  async createOne(
    options: CreateCheckPregnanciesOptions,
  ): Promise<CheckPregnancy> {
    const {
      date,
      note,
      farrowingDate,
      method,
      result,
      breedingId,
      organizationId,
      userCreatedId,
    } = options;

    const checkPregnancy = this.client.checkPregnancy.create({
      data: {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId,
        organizationId,
        userCreatedId,
      },
    });

    return checkPregnancy;
  }

  /** Update one CheckPregnancies to the database. */
  async updateOne(
    selections: UpdateCheckPregnanciesSelections,
    options: UpdateCheckPregnanciesOptions,
  ): Promise<CheckPregnancy> {
    const { checkPregnancyId } = selections;
    const { date, note, farrowingDate, method, result, breedingId, deletedAt } =
      options;

    const checkPregnancy = this.client.checkPregnancy.update({
      where: {
        id: checkPregnancyId,
      },
      data: {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId,
        deletedAt,
      },
    });

    return checkPregnancy;
  }
}
