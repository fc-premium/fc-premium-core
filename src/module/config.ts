import { Module } from '../module'
import { Core } from "../core";
import { ConfigHandler, KeyDoesNoExistError } from '../config-handler';


export class Config {

	public parentModule: Module;

	public constructor(module: Module) {
		this.parentModule = module;
	}

	private __add_key_prefix(key: string): string {
		return `${this.parentModule.name}.${key}`;
	}

	public has(key: string): boolean {
		key = this.__add_key_prefix(key);
		return ConfigHandler.has(key)
	}

	public keys(add_prefix: boolean = false): string[] {
		const prefix = `${this.parentModule.name}.`;

		let keys: string[] = ConfigHandler.keys().filter((key) =>
			key.startsWith(prefix)
		);

		if (add_prefix === false)
			keys = keys.map(key => key.slice(prefix.length))

		return keys;
	}

	public getMeta(key: string): ConfigHandler.Setting {
		key = this.__add_key_prefix(key);

		if (!ConfigHandler.has(key))
			throw new KeyDoesNoExistError(key);

		return ConfigHandler.getMeta(key);
	}

	public get(key: string): any {
		key = this.__add_key_prefix(key);

		if (!ConfigHandler.has(key))
			throw new KeyDoesNoExistError(key);

		return ConfigHandler.get(key);
	}

	public set(key: string, value: any): void {
		key = this.__add_key_prefix(key);

		if (!ConfigHandler.has(key))
			throw new KeyDoesNoExistError(key);

		ConfigHandler.set(key, value);
	}

	public reset(key: string, autosave: boolean = true) {
		key = this.__add_key_prefix(key);
		ConfigHandler.reset(key);
	}

	public resetAll() {
		this.keys(true).forEach(key =>
			ConfigHandler.reset(key)
		);
	}
}

// Exporting as a namespace so it can be imported inside another namespace
export namespace Config { };
