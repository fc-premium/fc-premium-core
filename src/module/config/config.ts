import { Module } from '../module'
import { Setting } from './setting'
import { Core } from "../../core";

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

	// public define(key: string, conf: any) {
	//
	// 	if (Core.config.has(key))
	// 		throw 'Config key already exists';
	//
	// }
	//
	// public undefine(key: string): void {
	// 	Core.config.delete(key)
	//
	// 	let storagedConfig = this.parentModule.storage.get('config');
	// 	delete storagedConfig[key];
	//
	// 	this.parentModule.storage.set('config', storagedConfig);
	// }
	//
	// public loadSavedConfig(): void {
	// 	let config = this.parentModule.storage.get('config');
	//
	// 	// If config not found
	// 	if (config === undefined) {
	// 		// Generate default config
	// 		this.saveConfig();
	// 	} else {
	// 		// Load current config
	// 		this.importConfig(config);
	// 	}
	// }
	//
	// public saveConfig(): void {
	// 	const config = this.parentModule.storage.has('config') ?
	// 		this.parentModule.storage.get('config') : {};
	//
	// 	const currentConfig = this.exportConfig();
	//
	// 	Object.assign(config, currentConfig);
	//
	// 	this.parentModule.storage.set('config', config);
	// }
	//
	// public importConfig(new_config: Object): void {
	// 	Object.keys(new_config).forEach((key) => {
	//
	// 		// set value if key is defined
	// 		if (Core.config.has(key)) {
	// 			this.set(key, new_config[key], false);
	// 		}
	// 	});
	// }
	//
	// public exportConfig(): Object {
	// 	const config = {};
	//
	// 	this.keys().forEach(key => {
	// 		let conf = Core.config.get(key).getValue();
	//
	// 		config[key] = conf.value;
	// 	});
	//
	// 	return config;
	// }
}
