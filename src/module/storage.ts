import { Core } from '../core'

/**
 * Interface between a module and the tampermonkey storage
 * @param module Module reference
 */

import StorageEntries = Core.Definitions.StorageEntries;

export class LocalStorage {
	private readonly module: Core.Module;

	public constructor(moduleReference: Core.Module) {
		this.module = moduleReference;
	}

	public has(key: string): boolean {
		const globalObject = Core.controller.get(StorageEntries.storage);
		return globalObject[this.module.name].hasOwnProperty(key);
	}

	public get(key: string): any {
		const globalObject = Core.controller.get(StorageEntries.storage);
		return globalObject[this.module.name][key];
	}

	public set(key: string, value: any): void {
		const globalObject = Core.controller.get(StorageEntries.storage);
		globalObject[this.module.name][key] = value;

		Core.controller.set(StorageEntries.storage, globalObject);
	}
}

// Exporting as a namespace so  it can be imported inside another namespace
export namespace LocalStorage { };
