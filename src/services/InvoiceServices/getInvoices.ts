import { apiClient } from '../apiClient';
import type { InvoiceListItem } from '../../types/InvoiceTypes';

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const { data } = await apiClient.get<InvoiceListItem[]>('/Invoices');
  return data;
}
