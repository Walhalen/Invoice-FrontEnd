import { apiClient } from '../apiClient';
import type { ProductListItem } from '../../types/ProductTypes';

export async function getProducts(): Promise<ProductListItem[]> {
  const { data } = await apiClient.get<ProductListItem[]>('/Product');
  return data;
}
