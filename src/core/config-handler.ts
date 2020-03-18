import { StorageEntries } from '../definitions'
import { Module } from '../module'
import { Core } from './core'

export namespace ConfigHandler {
	interface BaseSetting {
		title: string;
		description?: string;
	}

	export interface StringSetting extends BaseSetting {
		type: 'string';
		default: string;
		value?: string;
	}

	export interface PasswordSetting extends BaseSetting {
		type: 'password';
		default: string;
		value?: string;
	}

	export interface NumberSetting extends BaseSetting {
		type: 'number';
		minimum?: number;
		maximum?: number;
		default: number;
		value?: number;
	}

	export interface ColorSetting extends BaseSetting {
		type: 'color';
		default: string;
		value?: string;
	}

	export interface SelectSetting extends BaseSetting {
		type: 'select';
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

export class ConfigHandler {

	// static readonly MODULE: Module = MODULE;
	private settings: Map<string, ConfigHandler.Setting> = new Map();

	public has(key: string): boolean {
		return this.settings.has(key);
	}

	public getMeta(key: string): ConfigHandler.Setting {
		const setting = this.settings.get(key);
		setting.value = this.get(key);

		return setting;
	}

	public get(key: string): any {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.controller.get(StorageEntries.config);
		return registeredSettings[key];
	}

	public set(key: string, value: any): void {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.controller.get(StorageEntries.config);
		registeredSettings[key] = value;
		Core.controller.set(StorageEntries.config, registeredSettings);
	}

	public reset(key: string): void {
		const defaultValue = this.settings.get(key).default;

		this.set(key, defaultValue);
	}

	public register(key: string, setting): void {

		if (!this.settings.has(key)) {
			this.settings.set(key, setting);

		} else {
			console.error('Config already defined')
			return;
		}
	}

	public remove(key: string): void {
		console.log('removing', key)
		this.settings.delete(key);

		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.controller.get(StorageEntries.config);

		if (registeredSettings.hasOwnProperty(key)) {
			console.log('removing', registeredSettings)
			delete registeredSettings[key];
			Core.controller.set(StorageEntries.config, registeredSettings);
		}
	}

	public keys(): string[] {
		const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.controller.get(StorageEntries.config);
		return Object.keys(registeredSettings);
	}
}
