import React from "react";

import { FuegoProvider } from "@nandorojo/swr-firestore";
import firebase from "firebase/app";
import { firestore, auth, functions, storage } from "../functions/Firebase";

interface FuegoProviderProps {
	children: React.ReactNode
}

export class CustomFuego {
	public db: ReturnType<typeof firebase.firestore>
	public auth: typeof auth
	public functions: typeof functions
	public storage: typeof storage

	constructor() {
	  this.db = firestore;
	  this.auth = auth;
	  this.functions = functions;
	  this.storage = storage;
	}
}

export const fuego = new CustomFuego();

export default function ({ children }: FuegoProviderProps) {
  return (
    <FuegoProvider fuego={fuego}>
      { children }
    </FuegoProvider>
  );
}
