import { Injectable } from '@nestjs/common';
import {
  CreateContributorsOptions,
  GetContributorsSelections,
  GetOneContributorsSelections,
  UpdateContributorsOptions,
  UpdateContributorsSelections,
} from './contributors.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Contributor, Prisma } from '@prisma/client';

@Injectable()
export class ContributorsService {
  constructor(private readonly client: DatabaseService) {}
  async findAll(
    selections: GetContributorsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereContributor = {} as Prisma.ContributorWhereInput;
    const { pagination } = selections;

    const contributors = await this.client.contributor.findMany({
      where: { ...prismaWhereContributor, deletedAt: null },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.contributor.count({
      where: { ...prismaWhereContributor, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: contributors,
    });
  }

  /** Find one Contributors to the database. */
  async findOneBy(selections: GetOneContributorsSelections) {
    const prismaWhereContributor = {} as Prisma.ContributorWhereInput;
    const { contributorId, userId, organizationId } = selections;

    if (userId) {
      Object.assign(prismaWhereContributor, { userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereContributor, { organizationId });
    }

    if (contributorId) {
      Object.assign(prismaWhereContributor, { id: contributorId });
    }

    const contributor = await this.client.contributor.findFirst({
      where: { ...prismaWhereContributor, deletedAt: null },
    });

    return contributor;
  }

  /** Create one Contributors to the database. */
  async createOne(options: CreateContributorsOptions): Promise<Contributor> {
    const { userId, role, organizationId, userCreatedId } = options;

    const contributor = this.client.contributor.create({
      data: {
        userId,
        role,
        organizationId,
        userCreatedId,
      },
    });

    return contributor;
  }

  /** Update one Contributors to the database. */
  async updateOne(
    selections: UpdateContributorsSelections,
    options: UpdateContributorsOptions,
  ): Promise<Contributor> {
    const { contributorId } = selections;
    const { role, deletedAt } = options;

    const contributor = this.client.contributor.update({
      where: { id: contributorId },
      data: { role, deletedAt },
    });

    return contributor;
  }
}
