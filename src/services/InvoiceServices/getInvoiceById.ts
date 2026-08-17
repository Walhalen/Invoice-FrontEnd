import { apiClient } from '../apiClient';
import type { InvoiceDetail } from '../../types/InvoiceTypes';

export async function getInvoiceById(id: number): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<InvoiceDetail>(`/Invoices/${id}`);
  return data;
}
