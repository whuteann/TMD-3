export const CREATE_ACTION = 'create';
export const UPDATE_ACTION = 'update';
export const ARCHIVE_ACTION = 'archive';
export const REJECT_ACTION = 'reject';
export const APPROVE_ACTION = 'approve';
export const SUBMIT_ACTION = 'submit';
export const VERIFY_ACTION = 'verify';
export const DELETE_ACTION = 'delete';

export type Action = typeof CREATE_ACTION | typeof UPDATE_ACTION | typeof ARCHIVE_ACTION | typeof REJECT_ACTION | typeof APPROVE_ACTION | typeof SUBMIT_ACTION | typeof VERIFY_ACTION | typeof DELETE_ACTION;