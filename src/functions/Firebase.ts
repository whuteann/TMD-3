import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";

import {
  BUNKERS,
  CUSTOMERS,
  INVOICES,
  JOB_CONFIRMATIONS,
  PRODUCTS,
  PROCUREMENTS,
  PURCHASE_ORDERS,
  PURCHASE_VOUCHERS,
  QUOTATIONS,
  RECEIPTS,
  RFQS,
  SALES_CONFIRMATIONS,
  SHIP_SPARES,
  SUPPLIERS,
  USERS,
  BANKS,
  INCREMENTS,
  PORTS,
  SPARES_PROCUREMENTS,
  SPARES_PURCHASE_ORDERS,
  SPARES_PURCHASE_VOUCHERS,
  SALES,
  CUSTOMER_SEGMENTATIONS,
  SALES_PAYMENT_TERMS,
  PROCUREMENT_PAYMENT_TERMS
} from "../constants/Firebase";
import Constants from 'expo-constants';

const IS_INTERNAL = true;

// Change this to hide secretly later
const firebaseConfig = {
  apiKey: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].API_KEY,
  authDomain: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].AUTH_DOMAIN,
  projectId: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].PROJECT_ID,
  storageBucket: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].STORAGE_BUCKET,
  messagingSenderId: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].MESSAGING_SENDER_ID,
  appId: Constants.manifest?.extra?.firebase[IS_INTERNAL ? "debug" : "prod"].APP_ID
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

export default async function run() {
  await firestore.settings({
    ignoreUndefinedProperties: true,
    merge: true,
  });
}

export const firestore: firebase.firestore.Firestore = firebase.firestore();
export const auth: firebase.auth.Auth = firebase.auth();
export const functions: firebase.functions.Functions = firebase.app().functions('asia-southeast1');
export const storage: firebase.storage.Storage = firebase.storage();


if (firebase.app.length === 0) {
  firestore.settings({
    ignoreUndefinedProperties: true,
    merge: true,
  });
}

//db references
export const userRef = firestore.collection(USERS);

export const customerRef = firestore.collection(CUSTOMERS);
export const supplierRef = firestore.collection(SUPPLIERS);
export const bankRef = firestore.collection(BANKS);
export const receiptRef = firestore.collection(RECEIPTS);
export const rfqRef = firestore.collection(RFQS);
export const bunkerRef = firestore.collection(BUNKERS);
export const productRef = firestore.collection(PRODUCTS);
export const shipSpareRef = firestore.collection(SHIP_SPARES);
export const portRef = firestore.collection(PORTS);
export const salesPaymentTermRef = firestore.collection(SALES_PAYMENT_TERMS);
export const procurementPaymentTermRef = firestore.collection(PROCUREMENT_PAYMENT_TERMS);
export const customerSegRef = firestore.collection(CUSTOMER_SEGMENTATIONS);

export const quotationRef = firestore.collection(QUOTATIONS);
export const salesConfirmationRef = firestore.collection(SALES_CONFIRMATIONS);
export const jobConfirmationRef = firestore.collection(JOB_CONFIRMATIONS);
export const invoiceRef = firestore.collection(INVOICES);

export const salesRef = firestore.collection(SALES);

export const storageRef = storage.ref();

export const procurementRef = firestore.collection(PROCUREMENTS);
export const purchaseOrderRef = firestore.collection(PURCHASE_ORDERS);
export const purchaseVoucherRef = firestore.collection(PURCHASE_VOUCHERS);

export const sparesProcurementRef = firestore.collection(SPARES_PROCUREMENTS);
export const sparesPurchaseOrderRef = firestore.collection(SPARES_PURCHASE_ORDERS);
export const sparesPurchaseVoucherRef = firestore.collection(SPARES_PURCHASE_VOUCHERS);

export const incrementRef = firestore.collection(INCREMENTS); 