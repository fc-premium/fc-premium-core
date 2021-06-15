import { Module } from '../module'
import { Core } from "../core";

export class Config {

	public parentModule: Module;

	public constructor(module: Module) {
		this.parentModule = module;
	}

	private getPrefixedKey(key: string): string {
		return `${this.parentModule.name}.${key}`;
	}

	public has(key: string): boolean {
		key = this.getPrefixedKey(key);
		return Core.ConfigHandler.has(key)
	}

	public getMeta(key: string): any {
		key = this.getPrefixedKey(key);

		if (!Core.ConfigHandler.has(key))
			throw new Error(`'${key}' does not exist`)

		return Core.ConfigHandler.getMeta(key);
	}

	public get(key: string): any {
		key = this.getPrefixedKey(key);

		if (!Core.ConfigHandler.has(key))
			throw new Error(`'${key}' does not exist`)

		return Core.ConfigHandler.get(key);
	}

	public set(key: string, value: any): void {
		key = this.getPrefixedKey(key);

		if (!Core.ConfigHandler.has(key))
			throw new Error(`'${key}' does not exist`)

		Core.ConfigHandler.set(key, value);
	}

	public keys(fullpath: boolean = false): string[] {
		const prefix = `${this.parentModule.name}.`;

		let keys: string[] = Core.ConfigHandler.keys().filter((key) =>
			key.startsWith(prefix)
		);

		if (fullpath === false)
			keys = keys.map(key => key.slice(prefix.length))

		return keys;
	}

	public reset(key: string, autosave: boolean = true) {
		key = this.getPrefixedKey(key);
		Core.ConfigHandler.reset(key);
	}

	public resetAll() {
		this.keys(true).forEach(key =>
			Core.ConfigHandler.reset(key)
		);
	}
}

// Exporting as a namespace so  it can be imported inside another namespace
export namespace Config { };
