import { Module } from '../module'
import { Core } from "../core";

export class Config {

	public parentModule: Module;

	public constructor(module: Module) {
		this.parentModule = module;
	}

	public has(key: string): boolean {
		key = `${this.parentModule.name}.${key}`;
		return Core.config.has(key)
	}

	public getMeta(key: string): any {
		key = `${this.parentModule.name}.${key}`;

		if (!Core.config.has(key))
			throw new Error(`'${key}' does not exist`)

		return Core.config.getMeta(key);
	}

	public get(key: string): any {
		key = `${this.parentModule.name}.${key}`;

		if (!Core.config.has(key))
			throw new Error(`'${key}' does not exist`)

		return Core.config.get(key);
	}

	public set(key: string, value: any): void {
		key = `${this.parentModule.name}.${key}`;

		if (!Core.config.has(key))
			throw new Error(`'${key}' does not exist`)

		Core.config.set(key, value);
	}

	public keys(fullpath: boolean = false): string[] {
		const prefix = `${this.parentModule.name}.`;
		let keys: string[] = Core.config.keys().filter((key) =>
			key.startsWith(prefix)
		);

		if (fullpath === false)
			keys = keys.map(key => key.slice(prefix.length))

		return keys;
	}

	public reset(key: string, autosave: boolean = true) {
		key = `${this.parentModule.name}.${key}`;
		Core.config.reset(key);
	}

	public resetAll() {

		this.keys(true).forEach(key =>
			Core.config.reset(key)
		);
	}
}

// Exporting as a namespace so  it can be imported inside another namespace
export namespace Config { };
