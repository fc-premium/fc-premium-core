import * as _Controller from './controller'
import * as _LibraryHandler from './library-handler'
import * as _ModuleHandler from './module-handler'
import * as _ConfigHandler from './config-handler'
import * as _Module from './module'
import * as _Definitions from './definitions'

import StorageEntries = _Definitions.StorageEntries;

export namespace Core {

	export import Definitions = _Definitions;
	export import Controller = _Controller.Controller;
	export import LibraryHandler = _LibraryHandler.LibraryHandler;
	export import libraries = _LibraryHandler.LibraryHandler;
	export import ConfigHandler = _ConfigHandler.ConfigHandler;
	export import ModuleHandler = _ModuleHandler.ModuleHandler;
	export import Module = _Module.Module;


	// // public static libraries: Core.LibraryHandler = new _LibraryHandler();
	// public static modules: Core.ModuleHandler = new _ModuleHandler();
	// public static config: Core.ConfigHandler = new _ConfigHandler();

	export function isInstalled(): boolean {
		return Core.Controller.list().includes(StorageEntries.root)
	}

	export function install(): void {
		console.log('Core: Install');

		Core.Controller.set(StorageEntries.root, true);
		Core.Controller.set(StorageEntries.packages, {});
		Core.Controller.set(StorageEntries.config, {});
		Core.Controller.set(StorageEntries.storage, {});

		if (Core.onInstall !== null)
			Core.onInstall();
	}

	export function uninstall(): void {
		console.log('Core: Uninstall');

		Object.keys(StorageEntries).forEach(key =>
			Core.Controller.delete(key)
		);

		if (Core.onUninstall !== null)
			Core.onUninstall();
	}

	export function init() {
		// console.log(StorageEntries)

		// if (!this.isInstalled())
		// 	this.install();
	}

	export let onInstall: Function = null;
	export let onUninstall: Function = null;
}
