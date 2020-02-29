import { Config } from './config'
import { Debug } from './debug'
import { LocalStorage } from './storage'
import { Core } from '../index'

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
		requiredModules?: string[];
		preload?: string[];

		hasMobileSupport?: boolean;

		onload?: Function;
		onunload?: Function;
	}
}

export class Module {

	public readonly name: string;
	public readonly info: Module.Info;

	public readonly matches: readonly RegExp[];
	public readonly requiredModules: readonly string[];
	public readonly preload: readonly string[];

	public readonly hasMobileSupport: boolean;

	public readonly debug: Debug = new Debug(this);
	public readonly config: Config = new Config(this);
	public readonly storage: LocalStorage = new LocalStorage(this);
	// public readonly styles: CSSHandler = new CSSHandler(this);

	public onload: Function;
	public onunload: Function;

	// get onunload() {
	// 	return () => { }
	// }
	//
	// set onunload(value: Function) {
	// 	console.log('set onunload: ', value);
	// }

	private loaded: boolean = false;

	public constructor(data: Module.ParameterObject) {

		data = this.parseModuleParametes(data);

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

		this.matches = Object.freeze(this.parseMatchesToRegExp(data.matches));

		this.onload = data.onload;
		this.onunload = data.onunload;
	}

	get enabled(): boolean {
		return Core.modules.getModuleIsEnabled(this.name);
	}

	set enabled(value: boolean) {
		Core.modules.setModuleIsEnabled(this.name, value);
	}

	public isLoaded(): boolean {
		return this.loaded;
	}

	public setLoadedState(state: boolean): void {
		this.loaded = state;
	}

	private parseModuleParametes(data: Module.ParameterObject): Module.ParameterObject {
		data = data === undefined ? <Module.ParameterObject>{} : data;

		data.requiredModules = data.requiredModules instanceof Array ?
			data.requiredModules : [];

		data.preload = data.preload instanceof Array ?
			data.preload : [];

		data.hasMobileSupport = typeof data.hasMobileSupport === 'boolean' ?
			data.hasMobileSupport : false;

		data.matches = data.matches instanceof Array ?
			data.matches : [];

		data.onload = data.onload instanceof Function ?
			data.onload : () => { };

		data.onunload = data.onunload instanceof Function ?
			data.onunload : () => { };

		return data;
	}

	private parseMatchesToRegExp(matches: Module.URLMatchParameter[]): RegExp[] {

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

	public checkRequiredModules(): boolean {
		return this.requiredModules.every(requiredModuleName => {

			let requiredModule: Module = Core.modules.get(requiredModuleName);

			if (!requiredModule.isLoaded())
				this.debug.error(`Required module "${requiredModuleName}" is not loaded`);

			return requiredModule.isLoaded();
		});
	}

	public canExecuteInCurrentLocation(): boolean {

		const currentPath = location.pathname + location.search;

		return !this.matches.every(match =>
			!match.test(currentPath)
		);
	}

	public async preloadScripts(): Promise<unknown[]> {
		const preloadMap = this.preload.map(src => {
			return new Promise(function(resolve) {
				let script = document.createElement('script');

				document.head.appendChild(script);

				script.onload = function() {
					resolve(null);
				};

				script.setAttribute('src', src);
			});
		});

		return Promise.all(preloadMap);
	}

	public load(loadConfig: boolean = true): boolean {

		if (this.isLoaded() === true || this.checkRequiredModules() === false)
			return false

		if (this.enabled === false || this.canExecuteInCurrentLocation() === false)
			return false;

		this.preloadScripts().then(() => {
			this.onload();
			this.setLoadedState(true);
		});

		return true;
	}

	public unload(): void {
		debugger;
		if (this.isLoaded()) {
			this.onunload();
			this.setLoadedState(false);
		}
	}
}
