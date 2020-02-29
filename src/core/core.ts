import { StorageEntries } from '../definitions'
import { ModuleHandler } from './module-handler'
import { ConfigHandler } from './config-handler'
import { Controller } from './controller'

import { Module as _Module } from '../module'

export namespace Core {
	// export { Module } from '../module'
	export type Module = _Module;
}

export class Core {

	public static controller: Controller = new Controller();

	public static modules: ModuleHandler = new ModuleHandler();
	public static config: ConfigHandler = new ConfigHandler();

	public static isInstalled(): boolean {
		return Core.controller.list().includes(StorageEntries.root)
	}

	public static install(): void {
		console.log('Core: Install');

		Core.controller.set(StorageEntries.root, true);
		Core.controller.set(StorageEntries.packages, {});
		Core.controller.set(StorageEntries.config, {});
		Core.controller.set(StorageEntries.storage, {});
	}

	public static uninstall(): void {
		console.log('Core: Uninstall');

		Core.controller.delete(StorageEntries.root);
		Core.controller.delete(StorageEntries.packages);
		Core.controller.delete(StorageEntries.config);
		Core.controller.delete(StorageEntries.storage);
	}

	public static init() {
		if (!this.isInstalled())
			this.install();

		// this.modules.loadInstalledModules();
	}
}
