import { apiClient } from '../apiClient';

export async function deleteInvoice(id: number): Promise<boolean> {
  const { data } = await apiClient.delete<boolean>(`/Invoices/${id}`);
  return data;
}
