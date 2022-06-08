import { User } from "./User";

export type Auth = {
	user: User | null,
	token: string | null,
	provider?: string | null
}
