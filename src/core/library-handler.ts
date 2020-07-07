const libraries: Map<string, any> = new Map();

export class LibraryHandler {

	public has(name: string): boolean {
		return libraries.has(name);
	}

	public declare(name: string, value: any): void {

		if (libraries.has(name))
			new Error(`library "${name}" already exists`);

		libraries.set(name, value);
	}

	public import(name: string): any {
		if (libraries.has(name))
			new Error(`library "${name}" does not exist`);

		return libraries.get(name);
	}
}

// Exporting as a namespace so  it can be imported inside another namespace
export namespace LibraryHandler { };
