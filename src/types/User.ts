import { UserRole } from "./Common";

export type User = {
	id: string
	contacts?: Array<{number: string, type: string}>
	avatar?: string
	email: string,
	name?: string
	role?: UserRole,
	permission?: string[],
	expoTokens?: string[],
	joinedAt?: string
}
