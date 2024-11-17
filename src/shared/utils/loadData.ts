import { Application } from '@/api/application/types';
import fs from 'fs';
import path from 'path';

export const loadData = (): Application[] => {
  const dataPath = path.join(__dirname, '../../../seed.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const parsedData: Application[] = JSON.parse(rawData);

  // Deduplicate entries by `id`
  const uniqueData = Array.from(new Map(parsedData.map((item) => [item.id, item])).values());
  return uniqueData;
};
