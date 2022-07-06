export type UserRole = 'Super Admin' | 'General Manager' | 'Head of Marketing' | 'Head of Procurement' | 'Head of Finance & Accounts' | 'Marketing Executive/Marketing Assistant' | 'Puchasing Assistant' | 'Account Receivable' | 'Account Executive' | 'Account Assistant' | 'Operation Team';

export const SUPER_ADMIN_ROLE = 'Super Admin';
export const GENERAL_MANAGER_ROLE = 'General Manager';
export const HEAD_OF_MARKETING_ROLE = 'Head of Marketing';
export const HEAD_OF_PROCUREMENT_ROLE = 'Head of Procurement';
export const HEAD_OF_ACCOUNTS_ROLE = 'Head of Finance & Accounts';
export const MARKETING_EXECUTIVE_ROLE = 'Marketing Executive/Marketing Assistant';
export const PURCHASING_ASSISTANT_ROLE = 'Purchasing Assistant';
export const ACCOUNT_RECEIVABLE_ROLE = 'Account Receivable';
export const ACCOUNT_EXECUTIVE_ROLE = 'Account Executive';
export const ACCOUNT_ASSISTANT_ROLE = 'Account Assistant';
export const OPERATION_TEAM_ROLE = 'Operation Team';

export const IN_REVIEW = "In Review";
export const DRAFT = "Draft";
export const APPROVED = "Approved";
export const REJECTED = "Rejected";
export const CONFIRMED = "Confirmed";
export const NOT_CONFIRMED = "Not Confirmed";
export const ARCHIVED = "Archived";
export const REJECTING = "Rejecting";

export const NO_PURCHASE_VOUCHER = "No Purchase Voucher";
export const PV_ISSUED = "PV issued";

export const NO_INVOICE = "No Invoice";
export const ISSUED_INV = "Issued Inv.";

export const PENDING = "Pending";
export const REQUESTING = "Requesting";
export const SUBMITTED = "Submitted";

export const VERIFIED = "Verified";
export const DOC_SUBMITTED = "Document Submitted";
export const VERIFIED_DOC = "Verified Doc.";
export const APPROVED_DOC = "Approved Doc.";

export const PV_PENDING = "PV Pending";

// Document Codes
export const QUOTATION_CODE = "Q-TMD";
export const SALES_CODE = "SC-TMD";
export const JOB_CONFIRMATION_CODE = "TMDSB / JC"
export const INVOICE_CODE = "INV-TMD";
export const RECEIPT_CODE = "RE-TMD";

export const PROCUREMENT_CODE = "PRO-TMD";

export const PURCHASE_ORDER_TRADER_CODE = "POT-TMD";
export const PURCHASE_ORDER_VESSEL_CODE = "POV-TMD";
export const PURCHASE_ORDER_LORRY_CODE = "POL-TMD";
export const PO_REGEX = /POT-TMD|POV-TMD|POL-TMD/

export const PURCHASE_VOUCHER_CODE = "PV-TMD";

export const SPARES_PROCUREMENT_CODE = "SHIPPR-TMD";
export const SPARES_PURCHASE_ORDER_CODE = "SHIPPO-TMD";

export const REVISED_CODE = (count: number) => { return `-R${count}` }

const current_time = new Date();
export const DATE = `${current_time.getFullYear()}${(current_time.getMonth()+1) < 10 ? `0${current_time.getMonth()+1}` : `${current_time.getMonth()+1}`}`


