import { Config as _Config } from './config'
import { Debug as _Debug } from './debug'
import { LocalStorage as _LocalStorage } from './storage'
import { Core } from '../core'

export namespace Module {
	export type URLMatchParameter = string | RegExp;

	export interface Info {
		description: string;
		author: string;
		version: string;
	}

	export interface ParameterObject {
		name: string;
		description: string;
		author: string;
		version: string;
		matches: URLMatchParameter[];
		isLibrary?: boolean;
		requiredModules?: string[];
		preload?: string[];

		hasMobileSupport?: boolean;
	}
}

export class LoadEvent extends CustomEvent<void> {
	constructor() {
		super('load');
	}
}
export class UnloadEvent extends CustomEvent<void> {
	constructor() {
		super('unload');
	}
}

function parseModuleParametes(data: Module.ParameterObject): Module.ParameterObject {
	data = data === undefined ? <Module.ParameterObject>{} : data;

	data.requiredModules = data.requiredModules instanceof Array ?
		data.requiredModules : [];

	data.preload = data.preload instanceof Array ?
		data.preload : [];

	data.hasMobileSupport = typeof data.hasMobileSupport === 'boolean' ?
		data.hasMobileSupport : false;

	data.matches = data.matches instanceof Array ?
		data.matches : [];

	return data;
}

function parseMatchesToRegExp(matches: Module.URLMatchParameter[]): RegExp[] {

	const charsToReplace = ('-._~:/?#[]@!$&\'()+,;=').split('');

	return matches.map((match) => {
		if (typeof match === 'string') {
			charsToReplace.forEach(c => {
				match = (<string>match).replace(c, '\\' + c);
			});

			return new RegExp('^' + match.replace('*', '.*') + '$');
		}

		if (match instanceof RegExp)
			return match;

		throw 'Url match must be either a string or a RegExp';

	}).filter(match => match instanceof RegExp);
}


export class Module extends EventTarget {
	public readonly name: string;
	public readonly info: Module.Info;

	public readonly matches: readonly RegExp[];
	public readonly requiredModules: readonly string[];
	public readonly preload: readonly string[];

	public readonly hasMobileSupport: boolean;

	public readonly debug: Module.Debug = new Module.Debug(this);
	public readonly config: Module.Config = new Module.Config(this);
	public readonly storage: Module.LocalStorage = new Module.LocalStorage(this);
	// public readonly styles: CSSHandler = new CSSHandler(this);

	private __loaded: boolean = false;

	public constructor(data: Module.ParameterObject) {
		super();

		data = parseModuleParametes(data);

		this.name = data.name;

		this.info = <Module.Info>Object.freeze({
			description: data.description,
			author: data.author,
			version: data.version
		});

		this.requiredModules = Object.freeze(data.requiredModules);

		this.preload = Object.freeze(data.preload);

		this.hasMobileSupport = data.hasMobileSupport;

		// this.match = data.match;
		if (data.matches.length === 0)
			throw 'URL matches must be a non-empty array';

		this.matches = Object.freeze(parseMatchesToRegExp(data.matches));
	}

	get enabled(): boolean {
		return Core.ModuleHandler.getModuleIsEnabled(this.name);
	}

	set enabled(value: boolean) {
		Core.ModuleHandler.setModuleIsEnabled(this.name, value);
	}

	public isLoaded(): boolean {
		return this.__loaded;
	}

	public setLoadedState(state: boolean): void {
		this.__loaded = state;
	}

	public checkRequiredModules(): boolean {
		return this.requiredModules.every(requiredModuleName => {

			const requiredModule = Core.ModuleHandler.get(requiredModuleName);

			if (requiredModule === undefined || !requiredModule.isLoaded()) {
				this.debug.error(`Required module "${requiredModuleName}" is not loaded/installed`);
				return false;
			}

			return true;
		});
	}
	public canExecuteInCurrentLocation(): boolean {

		const currentPath = location.pathname + location.search;

		return !this.matches.every(match =>
			!match.test(currentPath)
		);
	}

	public async preloadScripts(): Promise<unknown[]> {
		if (this.preload.length === 0)
			return;

		const preloadMap = this.preload.map(src => {
			return new Promise(function (resolve) {

				let script = document.createElement('script');
				document.head.appendChild(script);

				script.onload = function () {
					resolve(null);
				};

				script.setAttribute('src', src);
			});
		});

		return Promise.all(preloadMap);
	}

	public load(loadConfig: boolean = true): boolean {

		console.log('trying to load', this.name)

		if (this.isLoaded() === true || this.checkRequiredModules() === false)
			return false

		if (this.enabled === false || this.canExecuteInCurrentLocation() === false)
			return false;

		this.preloadScripts().then(() => {
			this.setLoadedState(true);
			this.dispatchEvent(new LoadEvent())

		});

		return true;
	}

	public unload(): void {
		if (this.isLoaded()) {
			this.setLoadedState(false);
			this.dispatchEvent(new UnloadEvent())
		}
	}

	[Symbol.toStringTag]() {
		return 'Module';
	}
}

export namespace Module {
	export import Config = _Config;
	export import Debug = _Debug;
	export import LocalStorage = _LocalStorage;
}
