import { ContactUs } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetContactUsSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneContactUsSelections = {
  contactId: ContactUs['id'];
  organizationId: string;
};

export type UpdateContactUsSelections = {
  contactId: ContactUs['id'];
};

export type CreateContactUsOptions = Partial<ContactUs>;

export type UpdateContactUsOptions = Partial<ContactUs>;
