import { apiClient } from '../apiClient';

export async function importInvoiceXml(file: File): Promise<boolean> {
  const formData = new FormData();
  formData.append('xml', file);

  const { data } = await apiClient.post<boolean>('/Invoices', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
