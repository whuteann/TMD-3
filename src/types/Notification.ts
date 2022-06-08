import { Moment } from "moment"

export type Notification = {
  id?: string,
  created_at: Date,
  date: string,
  message: string,
  read: boolean,
  expires_at?: Date,
  data: any | { screen: string, docID: string },
}