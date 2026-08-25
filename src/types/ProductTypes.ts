export interface ProductListItem {
  id: number;
  code: string;
  name: string;
  indexCode: string | null;
  brand: string | null;
  groupName: string | null;
  lastPurchasePrice: number;
  lastVatRate: number;
  quantityOnHand: number;
}
