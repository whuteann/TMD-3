import { Dimensions, Platform } from "react-native"
import { ACCOUNT_ASSISTANT, ACCOUNT_EXECUTIVE, ACCOUNT_RECEIVABLE, GENERAL_MANAGER, HEAD_OF_ACCOUNTS, HEAD_OF_MARKETING, HEAD_OF_PROCUREMENT, MARKETING_EXECUTIVE, OPERATION_TEAM, PURCHASING_ASSISTANT, SUPER_ADMIN } from "../permissions/RolePermissions";
import { ACCOUNT_ASSISTANT_ROLE, ACCOUNT_EXECUTIVE_ROLE, ACCOUNT_RECEIVABLE_ROLE, GENERAL_MANAGER_ROLE, HEAD_OF_ACCOUNTS_ROLE, HEAD_OF_MARKETING_ROLE, HEAD_OF_PROCUREMENT_ROLE, MARKETING_EXECUTIVE_ROLE, OPERATION_TEAM_ROLE, PURCHASING_ASSISTANT_ROLE, SUPER_ADMIN_ROLE } from "../types/Common";

export const getWindow = () => {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  return { width, height };
}

export const pickBetween = (ios: string, android: string, web: string) => {
  var plat = Platform.OS;

  if (plat == "ios") {
    return ios;
  } else if (plat == "android") {
    return android;
  } else {
    return web;
  }
}

export const getRolePermission = (role: string) => {
  let permissions: Array<string> = [];

  switch (role) {
    case SUPER_ADMIN_ROLE:
      permissions = SUPER_ADMIN;
      break;

    case GENERAL_MANAGER_ROLE:
      permissions = GENERAL_MANAGER;
      break;

    case HEAD_OF_MARKETING_ROLE:
      permissions = HEAD_OF_MARKETING;
      break;

    case HEAD_OF_PROCUREMENT_ROLE:
      permissions = HEAD_OF_PROCUREMENT;
      break;

    case HEAD_OF_ACCOUNTS_ROLE:
      permissions = HEAD_OF_ACCOUNTS;
      break;

    case MARKETING_EXECUTIVE_ROLE:
      permissions = MARKETING_EXECUTIVE;
      break;

    case PURCHASING_ASSISTANT_ROLE:
      permissions = PURCHASING_ASSISTANT;
      break;

    case ACCOUNT_RECEIVABLE_ROLE:
      permissions = ACCOUNT_RECEIVABLE;
      break;

    case ACCOUNT_EXECUTIVE_ROLE:
      permissions = ACCOUNT_EXECUTIVE;
      break;

    case ACCOUNT_ASSISTANT_ROLE:
      permissions = ACCOUNT_ASSISTANT;
      break;

    case OPERATION_TEAM_ROLE:
      permissions = OPERATION_TEAM;
      break;

    default:
      permissions = [];
      break;
  }

  return permissions;
}

export const actionDelay = 5000;

export const loadingDelay = (action: ()=>void) =>{
  setTimeout(() => {
    action();
  }, actionDelay);
} 