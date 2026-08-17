export interface InvoiceSupplier {
  id: number;
  code: string;
  name: string;
}

export interface InvoiceItem {
  id: number;
  lineNumber: number;
  productCode: string;
  warehouseNumber: number;
  subWarehouseNumber: number;
  brand: string;
  indexCode: string;
  personalCode: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  sww: string;
  groupName: string;
}

export interface InvoiceDetail {
  id: number;
  supplier: InvoiceSupplier;
  payerCode: string;
  receiverCode: string;
  paymentMethodCode: string;
  documentTypeCode: string;
  currencyCode: string;
  number: string;
  issueDate: string;
  dueDate: string;
  netAmount: number;
  grossAmount: number;
  vatAmount: number;
  foreignCurrencyAmount: number;
  outstandingAmount: number;
  paidAmount: number;
  warehouseCode: string;
  items: InvoiceItem[];
}

export interface InvoiceListItem {
  id: number;
  supplierName: string;
  number: string;
  issueDate: string;
  dueDate: string;
  netAmount: number;
  grossAmount: number;
  vatAmount: number;
  outstandingAmount: number | null;
  paidAmount: number | null;
}
