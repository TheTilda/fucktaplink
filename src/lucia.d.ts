/// <reference types="lucia" />
declare namespace App {
	interface Locals {
		auth: import('./server/auth/lucia').Auth;
	}
	interface DatabaseUserAttributes {
		email: string;
	}
}





