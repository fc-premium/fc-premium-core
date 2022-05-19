import { Octokit } from "@octokit/rest";

import { Core } from './core'
import { FC } from "fc-rest-api-temp";
import { StorageEntries, NO_CACHE_HEADERS } from './definitions'

const octokit = new Octokit({
	auth: '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'
});

export namespace ModuleHandler {
	export interface WebpackModule {
		module: Core.Module;
		info: Core.Module.Info;
		config?: Core.ConfigHandler.ConfigObject;
		css?: string;

		__esModule: boolean;
		[Symbol.toStringTag]: string;
		// config?: any;
	}

	export interface ModuleEntry {
		name: string;
		info: Core.Module.Info;
		requiredModules: string[];
		script: string;
		enabled: boolean;
	}

	export type ModuleEntriesRoot = {
		[key: string]: ModuleEntry
	}

	export type StorageEntriesRoot = {
		[key: string]: Object
	}

	export type ConfigEntriesRoot = Core.ConfigHandler.SettingEntriesRoot

}

type WebpackModule = ModuleHandler.WebpackModule;
type ModuleEntriesRoot = ModuleHandler.ModuleEntriesRoot;
type ConfigEntriesRoot = ModuleHandler.ConfigEntriesRoot;
type StorageEntriesRoot = ModuleHandler.StorageEntriesRoot;
type ModuleEntry = ModuleHandler.ModuleEntry;


function is_webpack_module(object: WebpackModule): boolean {
	return object.__esModule === true
		&& object[Symbol.toStringTag] === 'Module'
		&& object.module !== undefined;
}

const __modules: Map<string, Core.Module> = new Map();

export class ModuleHandler {

	public static has(key: string): boolean {
		return __modules.has(key);
	}

	public static get(key: string): Core.Module {
		return __modules.get(key);
	}

	private static getModuleEntries(): ModuleEntriesRoot {
		return Core.Controller.get(StorageEntries.packages);
	}

	private static setModuleEntries(entries: ModuleEntriesRoot): void {
		Core.Controller.set(StorageEntries.packages, entries);
	}

	private static removeModuleEntry(module_name: string) {
		const registeredModules = this.getModuleEntries();
		delete registeredModules[module_name];
		this.setModuleEntries(registeredModules);
	}

	private static getStorageEntries(): StorageEntriesRoot {
		return Core.Controller.get(StorageEntries.storage);
	}

	private static setStorageEntries(entries: StorageEntriesRoot): void {
		Core.Controller.set(StorageEntries.storage, entries);
	}

	private static removeStorageKey(module_name: string) {
		const moduleStorage = this.getStorageEntries();
		delete moduleStorage[module_name];
		this.setStorageEntries(moduleStorage);
	}

	private static getConfigEntries(): ConfigEntriesRoot {
		return Core.Controller.get(StorageEntries.config);
	}

	private static setConfigEntries(entries: ConfigEntriesRoot): void {
		Core.Controller.set(StorageEntries.config, entries);
	}

	private static removeSettings(module_name: string) {

		const moduleKey = `${module_name}.`;

		Core.ConfigHandler.keys().forEach(key => {
			if (key.startsWith(moduleKey))
				Core.ConfigHandler.remove(key)
		});
	}

	public static getModuleIsEnabled(name: string): boolean {
		const registeredModules = this.getModuleEntries();

		return registeredModules[name].enabled;
	}

	public static setModuleIsEnabled(name: string, value: boolean): void {
		const registeredModules = this.getModuleEntries();

		if (registeredModules[name] !== undefined) {

			registeredModules[name].enabled = value;
			this.setModuleEntries(registeredModules);

			const module = this.get(name);

			if (value === true)
				module.load();
			else
				module.unload();
		}
	}

	private static contextualEval(source: string): WebpackModule {
		return (function (fcpremium) {
			const module = {
				exports: undefined
			};

			eval(source);

			return module.exports;
		})({ Core, FC });
	}

	private static registerWebpackModule(webpackModule: WebpackModule): void {

		const name = webpackModule.module.name;

		if (__modules.has(name) === false)
			__modules.set(name, webpackModule.module)

		// register settings
		if (webpackModule.config !== undefined)
			Core.ConfigHandler.register(webpackModule.config, name);

		// register style
		if (webpackModule.css !== undefined) {
			const styleElement = document.createElement('style');
			styleElement.innerHTML = webpackModule.css;

			styleElement.setAttribute('tag', 'fc-premium-module');
			styleElement.setAttribute('module-owner', name);

			document.head.appendChild(styleElement);
		}
	}

	private static evalModuleSource(source: string): Core.Module {
		const webpackModule = this.contextualEval(source);
		this.registerWebpackModule(webpackModule);

		return webpackModule.module;
	}

	private static registerModule(webpackModule: WebpackModule, sourceScript: string): void {
		const registeredModules = this.getModuleEntries();

		const module = webpackModule.module;
		const name = module.name;

		if (typeof name === 'string' && name.length > 0 && registeredModules[name] === undefined) {
			console.log('Registering ', name, registeredModules, registeredModules[name]);
			// Save module
			registeredModules[name] = <ModuleEntry>{
				name: name,
				info: module.info,
				requiredModules: module.requiredModules,
				script: sourceScript,
				enabled: true
			}

			this.setModuleEntries(registeredModules);

			// register settings
			if (webpackModule.config !== undefined) {
				const registeredSettings = this.getConfigEntries();

				Object.entries(webpackModule.config).forEach(([key, options]) =>
					registeredSettings[`${name}.${key}`] = options.default
				);

				this.setConfigEntries(registeredSettings);
			}

			// Create storage object
			const moduleStorage = this.getStorageEntries();
			moduleStorage[name] = {};

			this.setStorageEntries(moduleStorage);
		}
	}

	public static async installModuleFromURL(url: string, load: boolean = false) {

		const sourceCode: string = await fetch(url, {
			method: 'GET',
			headers: NO_CACHE_HEADERS,
			mode: 'no-cors'
		})
			.then(response => response.text());

		const webpackModule = this.contextualEval(sourceCode);

		if (is_webpack_module(webpackModule))
			this.registerModule(webpackModule, sourceCode);
		else
			throw `Unable to install module from ${url}`;

		if (load === true) {
			this.registerWebpackModule(webpackModule);
			webpackModule.module.load()
		}
	}

	public static async installModuleFromGithub(repo: any, load: boolean = false) {

		if (repo.lastRelease === undefined) {
			const releases = await octokit.repos.listReleases({
				owner: repo.owner.login,
				repo: repo.name,

				per_page: 1
			});

			repo.lastRelease = releases.data[0];
		}

		if (repo.lastRelease !== undefined && repo.lastRelease.assets.length !== 0) {
			const url = repo.lastRelease.assets[0].browser_download_url;

			if (url !== undefined)
				return this.installModuleFromURL(url, load);
		}
	}

	public static getInstalledModules(): Map<string, ModuleEntry> {
		// TODO: find something more secure
		const moduleEntries = this.getModuleEntries();

		return new Map(Object.entries(moduleEntries));
	}

	public static getLoadedModules(): Map<string, Core.Module> {
		// TODO: find something more secure
		return __modules;
	}

	private static getModuleEntriesSortedByRequirements(): ModuleEntry[][] {

		const moduleEntries = this.getModuleEntries();

		let moduleEntriesArray: ModuleEntry[] = Object.values(moduleEntries);

		// Filter out modules with circular requirements
		moduleEntriesArray = moduleEntriesArray.filter(entry => {

			const moduleName = entry.name;

			if (entry.requiredModules === undefined)
				return true;

			// Check every required module
			return entry.requiredModules.every((requiredModuleName: string) => {
				const requiredModule = moduleEntries[requiredModuleName];

				if (requiredModule === undefined) {
					console.error(`Module '${moduleName}' requires non installed module '${requiredModuleName}'`);
					return false;
				}

				if (requiredModule.requiredModules.includes(moduleName)) {
					console.error(`Modules '${moduleName}' and '${requiredModuleName}' must not require each other`);
					return false;
				}

				return true;
			});
		});

		moduleEntriesArray.sort((entry_a, entry_b) => {

			if (entry_a.requiredModules.includes(entry_b.name))
				return 1;

			if (entry_b.requiredModules.includes(entry_a.name))
				return -1;

			return 0;
		});

		let entriesMatrix: ModuleEntry[][] = new Array(moduleEntriesArray.length)
			.fill(undefined)
			.map(_ => []);

		let lastItemIndex = 0;

		moduleEntriesArray.forEach((module: ModuleEntry) => {
			let i = lastItemIndex;

			while (i >= 0) {

				const requiredInRow = module.requiredModules.some(required_name =>
					entriesMatrix[i].find(m_module =>
						m_module.name === required_name
					)
				);

				if (requiredInRow) {
					lastItemIndex += 1;
					break;
				}
			}

			entriesMatrix[i + 1].push(module)
			i -= 1;
		});

		return entriesMatrix.filter(row => row.length > 0);
	}

	public static async loadInstalledModules(): Promise<void> {

		const moduleMatrix = this.getModuleEntriesSortedByRequirements();

		await moduleMatrix.reduce(async (previousPromise, row): Promise<any> => {
			await previousPromise;
			return Promise.all(row.map(entry => {
				const module = this.evalModuleSource(entry.script)
				module.load();
			}));
		}, Promise.resolve());
	}

	public static unloadInstalledModules(): void {
		__modules.forEach(module => {

			if (!module.isLoaded())
				return;

			module.unload();

			// MODULE.debug.log(`Unloaded [${module.name}]`);
			console.log(`Unloaded [${module.name}]`);
		});
	}

	public static reloadInstalledModules(): void {
		// MODULE.debug.log('Reloading modules...');

		__modules.forEach(module => {

			if (!module.isLoaded())
				return;

			module.unload();
			module.load();

			// MODULE.debug.log(`Reloaded [${module.name}]`);
		});
	}

	public static uninstall(name: string): void {

		this.removeStorageKey(name);
		this.removeSettings(name);
		this.removeModuleEntry(name)

		if (__modules.has(name)) {
			try {
				__modules.get(name).unload();
			} catch (e) { }

			__modules.delete(name);
		}

	}
}
