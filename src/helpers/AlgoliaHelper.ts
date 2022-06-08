import algoliasearch from 'algoliasearch';
import Constants from 'expo-constants';
import { BUNKERS, CUSTOMERS, INVOICES, JOB_CONFIRMATIONS, PROCUREMENTS, PURCHASE_ORDERS, PURCHASE_VOUCHERS, QUOTATIONS, RECEIPTS, SALES_CONFIRMATIONS, SPARES_PROCUREMENTS, SPARES_PURCHASE_ORDERS, SPARES_PURCHASE_VOUCHERS, SUPPLIERS, USERS } from '../constants/Firebase';

export type AlgoliaKey = {
  id: string,
  searchKey: string,
  apiKey: string
}

const IS_INTERNAL = true;

export const KEYS: AlgoliaKey = {
  id: Constants.manifest?.extra?.algolia[IS_INTERNAL ? "debug" : "prod"].id,
  searchKey: Constants.manifest?.extra?.algolia[IS_INTERNAL ? "debug" : "prod"].search_key,
  apiKey: Constants.manifest?.extra?.algolia[IS_INTERNAL ? "debug" : "prod"].api_key,
};

export const client = algoliasearch(KEYS.id, KEYS.searchKey);
export const admin = algoliasearch(KEYS.id, KEYS.apiKey);

export const quotationIndexRef = client.initIndex(QUOTATIONS);
export const invoiceIndexRef = client.initIndex(INVOICES);
export const jobConfirmationIndexRef = client.initIndex(JOB_CONFIRMATIONS);
export const salesConfirmationIndexRef = client.initIndex(SALES_CONFIRMATIONS);
export const receiptIndexRef = client.initIndex(RECEIPTS);
export const procurementIndexRef = client.initIndex(PROCUREMENTS);
export const purchaseOrderIndexRef = client.initIndex(PURCHASE_ORDERS);
export const purchaseVoucherIndexRef = client.initIndex(PURCHASE_VOUCHERS);
export const sparesProcurementIndexRef = client.initIndex(SPARES_PROCUREMENTS);
export const sparesPurchaseOrderIndexRef = client.initIndex(SPARES_PURCHASE_ORDERS);
export const sparesPurchaseVoucherIndexRef = client.initIndex(SPARES_PURCHASE_VOUCHERS);

export const userIndexRef = client.initIndex(USERS);
export const customerIndexRef = client.initIndex(CUSTOMERS);
export const supplierIndexRef = client.initIndex(SUPPLIERS);
export const bunkerIndexRef = client.initIndex(BUNKERS);