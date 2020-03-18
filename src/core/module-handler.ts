import { StorageEntries } from '../definitions'
import { ConfigHandler } from './config-handler'
import { Core } from './core'
import { Module } from '../module'
import { NO_CACHE_HEADERS } from '../definitions'
import * as fcpremium from '../index'


const Octokit = require("@octokit/rest");

const octokit = new Octokit();

export namespace ModuleHandler {
	export interface WebpackModule {
		module: Module;
		info: Module.Info;
		config?: ConfigHandler.ConfigObject;
		css?: string;

		__esModule: boolean;
		[Symbol.toStringTag]: string;
		// config?: any;
	}

	export interface ModuleEntry {
		name: string;
		info: Module.Info;
		script: string;
		enabled: boolean;
	}

	export type ModuleEntriesRoot = {
		[key: string]: ModuleEntry
	}
}

export class ModuleHandler {

	// static readonly MODULE: Module = MODULE;
	private modules: Map<string, Module> = new Map();

	public has(key: string): boolean {
		return this.modules.has(key);
	}

	public get(key: string): Module {
		return this.modules.get(key);
	}

	private registerModule(webpackModule: ModuleHandler.WebpackModule, sourceScript: string): void {
		const registeredModules: ModuleHandler.ModuleEntriesRoot = Core.controller.get(StorageEntries.packages);

		const module = webpackModule.module;
		const name = module.name;

		if (typeof name === 'string' && name.length > 0 && registeredModules[name] === undefined) {
			console.log('Registering ', name, registeredModules, registeredModules[name]);
			// Save module
			registeredModules[name] = <ModuleHandler.ModuleEntry>{
				name: name,
				info: module.info,
				script: sourceScript,
				enabled: true
			}

			Core.controller.set(StorageEntries.packages, registeredModules);


			// register settings
			if (webpackModule.config !== undefined) {
				const registeredSettings: ConfigHandler.SettingEntriesRoot = Core.controller.get(StorageEntries.config);

				Object.entries(webpackModule.config).forEach(([key, options]) =>
					registeredSettings[`${name}.${key}`] = options.default
				);

				Core.controller.set(StorageEntries.config, registeredSettings);
			}

			// Create storage object
			const moduleStorage: Object = Core.controller.get(StorageEntries.storage);
			moduleStorage[name] = {};

			Core.controller.set(StorageEntries.storage, moduleStorage);
		}
	}

	public getModuleIsEnabled(name: string): boolean {
		const registeredModules: ModuleHandler.ModuleEntriesRoot = Core.controller.get(StorageEntries.packages);

		return registeredModules[name].enabled;
	}

	public setModuleIsEnabled(name: string, value: boolean): void {
		const registeredModules: ModuleHandler.ModuleEntriesRoot = Core.controller.get(StorageEntries.packages);

		if (registeredModules[name] !== undefined) {

			registeredModules[name].enabled = value;
			Core.controller.set(StorageEntries.packages, registeredModules);


			const module = this.get(name);
			console.log('setModuleIsEnabled', module)

			if (value === true)
				module.load();
			else
				module.unload();

		}
	}

	// Sort modules based on requirements
	private sortModulesByRequirements(): void {

		// Check for colliding requirements
		this.modules.forEach((module: Module) => {

			const moduleName = module.name;

			if (module.requiredModules === undefined)
				return;

			module.requiredModules.every((requiredModuleName: string) => {
				if (!this.modules.has(requiredModuleName))
					throw `Module '${moduleName}' requires '${requiredModuleName}'`;

				const requiredModule = this.modules.get(requiredModuleName);

				if (requiredModule.requiredModules.includes(moduleName))
					throw `Modules '${moduleName}' and '${requiredModuleName}' must not require each other`;

			});
		});

		let moduleArray: [string, Module][] = Array.from(this.modules.entries());

		moduleArray.sort(([_a, MODULE_A], [_b, MODULE_B]) => {
			if (MODULE_A.requiredModules.includes(_b))
				return 1;

			if (MODULE_B.requiredModules.includes(_a))
				return -1;

			return 0;
		});

		// Clear and re-set modules
		this.modules.clear();

		moduleArray.forEach(([key, value]) => {
			this.modules.set(key, value);
		});
	}

	public async installModuleFromGithub(repo: any, load: boolean = false) {

		const releases = await octokit.repos.listReleases({
			owner: repo.owner.login,
			repo: repo.name
		});

		const url = releases.data[0].assets[0].browser_download_url;

		return this.installModuleFromURL(url, load);
	}

	public async installModuleFromURL(url: string, load: boolean = false) {

		const sourceCode: string = await fetch(url, { headers: NO_CACHE_HEADERS })
			.then(response => response.text());

		const webpackModule = this.contextualEval(sourceCode);

		// Check if is a webpack module
		if (webpackModule.__esModule === true && webpackModule[Symbol.toStringTag] === 'Module' && webpackModule.module !== undefined)
			this.registerModule(webpackModule, sourceCode);
		else
			console.log(`Unable to install module from ${url}`)

		if (load === true) {
			console.log('Load is enabled', webpackModule)
			this.evalWebpackModule(webpackModule);
			webpackModule.module.load()
		}
	}

	public uninstall(name: string): void {

		// Remove storage key
		const moduleStorage: Object = Core.controller.get(StorageEntries.storage);
		delete moduleStorage[name];
		Core.controller.set(StorageEntries.storage, moduleStorage);

		// Remove settings
		const moduleKey = `${name}.`;
		Core.config.keys().forEach(key => {
			if (key.startsWith(moduleKey))
				Core.config.remove(key)
		})

		// remove package
		const registeredModules: Object = Core.controller.get(StorageEntries.packages);
		delete registeredModules[name];
		Core.controller.set(StorageEntries.packages, registeredModules);

		if (this.modules.has(name)) {
			this.modules.get(name).unload();
			this.modules.delete(name);
		}

	}

	// Return a list of the names of the installed modules
	public listInstalledModules(): string[] {
		return Object.keys(<ModuleHandler.ModuleEntriesRoot>Core.controller.get(StorageEntries.packages));
	}

	// Return the installed modules
	public getInstalledModules(): Map<string, Module> {
		// TODO: find something more secure
		return this.modules;
	}

	private contextualEval(source: string): ModuleHandler.WebpackModule {
		return (function(fcpremium) {
			return eval(source);
		})(fcpremium);
	}

	private evalModuleSource(source: string) {

		const webpackModule = this.contextualEval(source);
		this.evalWebpackModule(webpackModule);
	}

	private evalWebpackModule(webpackModule: ModuleHandler.WebpackModule) {

		const name = webpackModule.module.name;

		if (this.modules.has(name) === false)
			this.modules.set(name, webpackModule.module)

		// register settings
		if (webpackModule.config !== undefined) {
			Object.entries(webpackModule.config).forEach(([key, options]) =>
				Core.config.register(`${name}.${key}`, options)
			);
		}

		// register style
		if (webpackModule.css !== undefined) {
			const styleElement = document.createElement('style');
			styleElement.innerHTML = webpackModule.css;

			styleElement.setAttribute('tag', 'fc-premium-module');
			styleElement.setAttribute('module-owner', name);

			document.head.appendChild(styleElement);
		}
	}

	private evalInstalledModules() {
		const moduleEntries = <ModuleHandler.ModuleEntriesRoot>Core.controller.get(StorageEntries.packages);

		Object.keys(moduleEntries).forEach(name =>
			this.evalModuleSource(moduleEntries[name].script)
		);
	}

	public loadModule(module: Module) {
		if (module.load()) {
			console.log(
				`Loaded [${module.name}]:` +
				`\n\tDesc:    ${module.info.description}` +
				`\n\tAuthor:  ${module.info.author}` +
				`\n\tVersion: ${module.info.version}`
			);
		} else {
			// MODULE.debug.log('Didnt load ', module.name);
		}
	}

	public loadInstalledModules(): void {

		this.evalInstalledModules();

		this.sortModulesByRequirements();

		this.modules.forEach(this.loadModule);
	}

	public unloadInstalledModules(): void {
		this.modules.forEach(module => {

			if (!module.isLoaded())
				return;

			module.unload();

			// MODULE.debug.log(`Unloaded [${module.name}]`);
			console.log(`Unloaded [${module.name}]`);
		});
	}

	public reloadInstalledModules(): void {
		// MODULE.debug.log('Reloading modules...');

		this.modules.forEach(module => {

			if (!module.isLoaded())
				return;

			module.onunload();
			module.onload();

			// MODULE.debug.log(`Reloaded [${module.name}]`);
		});
	}
}
