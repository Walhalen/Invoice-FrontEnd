import { apiClient } from '../apiClient';
import type { InvoiceDetail } from '../../types/InvoiceTypes';

export async function importInvoiceXml(file: File): Promise<InvoiceDetail> {
  const formData = new FormData();
  formData.append('xml', file);

  const { data } = await apiClient.post<InvoiceDetail>('/Invoices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
