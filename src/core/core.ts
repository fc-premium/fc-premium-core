import { Controller as _Controller } from './controller'
import { LibraryHandler as _LibraryHandler } from './library-handler'
import { ModuleHandler as _ModuleHandler } from './module-handler'
import { ConfigHandler as _ConfigHandler } from './config-handler'
import { Module as _Module } from '../module'
import * as _Definitions from '../definitions'

import StorageEntries = _Definitions.StorageEntries;

export class Core {

	public static controller: Core.Controller = new _Controller();
	public static libraries: Core.LibraryHandler = new _LibraryHandler();
	public static modules: Core.ModuleHandler = new _ModuleHandler();
	public static config: Core.ConfigHandler = new _ConfigHandler();

	public static isInstalled(): boolean {
		return Core.controller.list().includes(StorageEntries.root)
	}

	public static install(): void {
		console.log('Core: Install');

		Core.controller.set(StorageEntries.root, true);
		Core.controller.set(StorageEntries.packages, {});
		Core.controller.set(StorageEntries.config, {});
		Core.controller.set(StorageEntries.storage, {});

		if (Core.onInstall !== null)
			Core.onInstall();
	}

	public static uninstall(): void {

		console.log('Core: Uninstall');

		Core.controller.delete(StorageEntries.root);
		Core.controller.delete(StorageEntries.packages);
		Core.controller.delete(StorageEntries.config);
		Core.controller.delete(StorageEntries.storage);

		if (Core.onUninstall !== null)
			Core.onUninstall();
	}

	public static init() {
		if (!this.isInstalled())
			this.install();
	}

	public static onInstall: Function = null;
	public static onUninstall: Function = null;
}


export namespace Core {
	export import Definitions = _Definitions;
	export import Controller = _Controller;
	export import LibraryHandler = _LibraryHandler;
	export import ModuleHandler = _ModuleHandler;
	export import ConfigHandler = _ConfigHandler;
	export import Module = _Module;
}
