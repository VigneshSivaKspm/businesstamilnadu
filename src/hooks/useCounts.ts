import { businessService } from '@/services';
import { useQuery } from './useQuery';

/** Live listing counts by district, category, subcategory and letter (optionally within one district). */
export const useCounts = (district?: string) =>
  useQuery(`counts:${district ?? 'all'}`, () => businessService.getCounts(district)).data;
