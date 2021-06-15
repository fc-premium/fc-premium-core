const __libraries: Map<string, any> = new Map();

export class LibraryHandler {

	public static has(name: string): boolean {
		return __libraries.has(name);
	}

	public static declare(name: string, value: any): void {
		if (__libraries.has(name))
			new Error(`library "${name}" already exists`);

		__libraries.set(name, value);
	}

	public static import(name: string): any {
		if (__libraries.has(name))
			new Error(`library "${name}" does not exist`);

		return __libraries.get(name);
	}
}
