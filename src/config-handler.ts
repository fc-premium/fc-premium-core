import { StorageEntries } from './definitions'
import { Core } from './core'

export namespace ConfigHandler {

	const enum ConfigType {
		String = 'string',
		Password = 'password',
		Number = 'number',
		Color = 'color',
		Select = 'select',
	}

	interface BaseSetting {
		title: string;
		description?: string;
	}

	export interface StringSetting extends BaseSetting {
		type: ConfigType.String;
		default: string;
		value?: string;
	}

	export interface PasswordSetting extends BaseSetting {
		type: ConfigType.Password;
		default: string;
		value?: string;
	}

	export interface NumberSetting extends BaseSetting {
		type: ConfigType.Number;
		minimum?: number;
		maximum?: number;
		default: number;
		value?: number;
	}

	export interface ColorSetting extends BaseSetting {
		type: ConfigType.Color;
		default: string;
		value?: string;
	}

	export interface SelectSetting extends BaseSetting {
		type: ConfigType.Select;
		items: string[];
		default: number;
		value?: number;
	}

	export type Setting = StringSetting | NumberSetting |
		PasswordSetting | SelectSetting | ColorSetting

	export type ConfigObject = {
		[key: string]: Setting
	}

	export type SettingEntriesRoot = {
		[key: string]: any
	}
}

const __settings: Map<string, ConfigHandler.Setting> = new Map();

export class ConfigHandler {

	public static has(key: string): boolean {
		return __settings.has(key);
	}

	public static getMeta(key: string): ConfigHandler.Setting {
		const setting = __settings.get(key);

		if (setting !== undefined)
			setting.value = this.get(key);

		return setting;
	}

	public static get(key: string): any {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.Controller.get(StorageEntries.config);
		return registeredSettings[key];
	}

	public static set(key: string, value: any): void {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.Controller.get(StorageEntries.config);
		registeredSettings[key] = value;

		Core.Controller.set(StorageEntries.config, registeredSettings);
	}

	public static reset(key: string): void {
		const defaultValue = __settings.get(key).default;

		this.set(key, defaultValue);
	}

	public static register(settings: ConfigHandler.ConfigObject, prefix: string = ''): void {

		Object.entries(settings).forEach(([key, setting]) => {
			key = `${prefix}.${key}`;

			if (__settings.has(key) === false)
				__settings.set(key, setting);
		});
	}

	public static registerInStorage(settings: ConfigHandler.ConfigObject, prefix: string = ''): void {

		const registeredSettings = Core.Controller.get(StorageEntries.config);

		Object.entries(settings).forEach(([key, setting]) => {
			key = `${prefix}.${key}`;
			registeredSettings[key] = setting.default;
		});

		Core.Controller.set(StorageEntries.config, registeredSettings);
	}

	public static remove(key: string): void {
		__settings.delete(key);

		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.Controller.get(StorageEntries.config);

		if (registeredSettings.hasOwnProperty(key)) {
			delete registeredSettings[key];
			Core.Controller.set(StorageEntries.config, registeredSettings);
		}
	}

	public static keys(prefix: string = ''): string[] {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.Controller.get(StorageEntries.config);
		return Object.keys(registeredSettings).filter(key =>
			key.startsWith(prefix)
		);
	}
}
