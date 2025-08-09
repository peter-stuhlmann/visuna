import { ObjectId } from 'mongodb';
import { PageElement } from '../content-elements/default/types';

export type Page = {
  _id: string;
  slug: string;
  name: string;
  createdAt: string;
  published: boolean;
  pageElements: PageElement[];
};

export type DBPage = {
  _id: ObjectId;
  slug: Page['slug'];
  name: Page['name'];
  createdAt: Page['createdAt'];
  published: Page['published'];
  pageElements: ObjectId[];
};
