import type { Collection, Document, Filter, Sort } from 'mongodb';
import { toApi } from '../db.ts';

/** Runs a paginated find and returns the frontend's `Paginated<T>` shape. */
export async function paginate<T extends Document & { _id: string }>(
  collection: Collection<T>,
  filter: Filter<T>,
  sort: Sort,
  page: number,
  pageSize: number,
) {
  const [docs, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
  ]);
  return {
    items: docs.map((d) => toApi(d as T)),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
