import { Core } from '../core'
import { StorageEntries } from '../definitions'

export class LocalStorage {
	private readonly module: Core.Module;

	public constructor(moduleReference: Core.Module) {
		this.module = moduleReference;
	}

	public has(key: string): boolean {
		const globalObject = Core.Controller.get(StorageEntries.storage);
		return globalObject[this.module.name].hasOwnProperty(key);
	}

	public get(key: string): any {
		const globalObject = Core.Controller.get(StorageEntries.storage);
		return globalObject[this.module.name][key];
	}

	public set(key: string, value: any): void {
		const globalObject = Core.Controller.get(StorageEntries.storage);
		globalObject[this.module.name][key] = value;

		Core.Controller.set(StorageEntries.storage, globalObject);
	}
}

// Exporting as a namespace so  it can be imported inside another namespace
export namespace LocalStorage { };
