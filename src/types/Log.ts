import { Action } from "../constants/Action"
import { User } from "./User"

export type Log = {
	id?: string,
	action: Action,
	action_by: User,
	created_at: Date,
	data: any
}