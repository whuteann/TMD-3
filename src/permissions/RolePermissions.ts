import { ARCHIVE_QUOTATION, CREATE_PROCUREMENT, CREATE_PURCHASE_VOUCHER, CREATE_QUOTATION, CREATE_SPARES_PROCUREMENT, CREATE_SPARES_PURCHASE_ORDER, CREATE_SPARES_PURCHASE_VOUCHER, CREATE_USER, FINAL_REVIEW_SPARES_PURCHASE_ORDER, ISSUE_INVOICE, ISSUE_OFFICIAL_RECEIPT, ISSUE_PURCHASE_ORDER, PREPARE_PURCHASE_ORDER, PROCEED_PURCHASE_ORDER, REVIEW_INVOICE, REVIEW_PURCHASE_ORDER, REVIEW_PURCHASE_VOUCHER, REVIEW_QUOTATION, REVIEW_SPARES_PROCUREMENT, REVIEW_SPARES_PURCHASE_ORDER, UPLOAD_BDN, UPLOAD_NOTE_BDN, UPLOAD_PURCHASE_ORDER, VIEW_INVOICE, VIEW_JOB_CONFIRMATION, VIEW_OFFICIAL_RECEIPT, VIEW_PROCUREMENT, VIEW_PURCHASE_ORDER, VIEW_PURCHASE_VOUCHER, VIEW_QUOTATION, VIEW_SALES_CONFIRMATION, VIEW_SPARES_PROCUREMENT, VIEW_SPARES_PURCHASE_ORDER, VIEW_SPARES_PURCHASE_VOUCHER } from "./Permissions";

export const MARKETING_EXECUTIVE = [
  VIEW_QUOTATION,
  CREATE_QUOTATION,
  ARCHIVE_QUOTATION,
  UPLOAD_PURCHASE_ORDER,
  PROCEED_PURCHASE_ORDER,
  VIEW_SALES_CONFIRMATION,
  VIEW_JOB_CONFIRMATION,
  VIEW_PURCHASE_ORDER,
  CREATE_PROCUREMENT,
  VIEW_PROCUREMENT,
  PREPARE_PURCHASE_ORDER
];

export const OPERATION_TEAM = [
  VIEW_JOB_CONFIRMATION,
  UPLOAD_BDN,
  VIEW_INVOICE,
  ISSUE_INVOICE,
  ISSUE_OFFICIAL_RECEIPT,
  VIEW_OFFICIAL_RECEIPT,
  ISSUE_PURCHASE_ORDER,
  VIEW_PURCHASE_ORDER,
  VIEW_PURCHASE_VOUCHER,
  UPLOAD_NOTE_BDN,
  CREATE_PURCHASE_VOUCHER,
  VIEW_SPARES_PURCHASE_ORDER
];

export const ACCOUNT_ASSISTANT = [
  ...Array.from(new Set([
    CREATE_SPARES_PURCHASE_VOUCHER,
    VIEW_SPARES_PURCHASE_VOUCHER,
    ...OPERATION_TEAM
  ]))
];

export const PURCHASING_ASSISTANT = [
  CREATE_SPARES_PROCUREMENT,
  VIEW_SPARES_PROCUREMENT,
  CREATE_SPARES_PURCHASE_ORDER,
  VIEW_SPARES_PURCHASE_ORDER
];

export const ACCOUNT_RECEIVABLE = [
  ...ACCOUNT_ASSISTANT
];

export const ACCOUNT_EXECUTIVE = [
  ...ACCOUNT_ASSISTANT
];


export const HEAD_OF_MARKETING = [
  ...Array.from(new Set([
    REVIEW_QUOTATION,
    CREATE_PROCUREMENT,
    REVIEW_PURCHASE_ORDER,
    ...MARKETING_EXECUTIVE
  ]))
];

export const HEAD_OF_PROCUREMENT = [
  ...Array.from(new Set([
    REVIEW_SPARES_PROCUREMENT,
    REVIEW_SPARES_PURCHASE_ORDER,
    ...PURCHASING_ASSISTANT
  ]))
];

export const HEAD_OF_ACCOUNTS = [
  ...Array.from(new Set([
    REVIEW_INVOICE,
    REVIEW_PURCHASE_VOUCHER,
    ...ACCOUNT_ASSISTANT,
    ...ACCOUNT_RECEIVABLE,
    ...ACCOUNT_EXECUTIVE
  ]))
];

export const GENERAL_MANAGER = [
  ...Array.from(new Set([
    FINAL_REVIEW_SPARES_PURCHASE_ORDER,
    ...HEAD_OF_MARKETING,
    ...HEAD_OF_PROCUREMENT,
    ...HEAD_OF_ACCOUNTS
  ]))
];

export const SUPER_ADMIN = [
  CREATE_USER,
  ...GENERAL_MANAGER
];
