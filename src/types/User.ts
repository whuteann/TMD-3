import { UserRole } from "./Common";

export type User = {
	id: string
	contacts?: Array<{number: string, type: string}>
	avatar?: string
	email: string,
	name?: string
	role?: UserRole,
	remember_me?: boolean,
	last_login?: any,
	permission?: string[],
	expoTokens?: string[],
	joinedAt?: string,
	quotation_count?: number,
}
