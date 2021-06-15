import * as _Controller from './controller'
import * as _LibraryHandler from './library-handler'
import * as _ModuleHandler from './module-handler'
import * as _ConfigHandler from './config-handler'
import * as _Module from './module'
import * as _Definitions from './definitions'

import { CoreInstalledEvent, CoreUninstalledEvent } from './events'

import StorageEntries = _Definitions.StorageEntries;

export namespace Core {

	export import Definitions = _Definitions;
	export import Controller = _Controller.Controller;
	export import LibraryHandler = _LibraryHandler.LibraryHandler;
	export import libraries = _LibraryHandler.LibraryHandler;
	export import ConfigHandler = _ConfigHandler.ConfigHandler;
	export import ModuleHandler = _ModuleHandler.ModuleHandler;
	export import Module = _Module.Module;

	const __event_target = new EventTarget();

	export const addEventListener: EventTarget['addEventListener'] = __event_target.addEventListener.bind(__event_target);
	export const removeEventListener: EventTarget['removeEventListener'] = __event_target.removeEventListener.bind(__event_target);
	export const dispatchEvent: EventTarget['dispatchEvent'] = __event_target.dispatchEvent.bind(__event_target);


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

		Core.dispatchEvent(new CoreInstalledEvent);
	}

	export function uninstall(): void {
		console.log('Core: Uninstall');

		Object.keys(StorageEntries).forEach(key =>
			Core.Controller.delete(key)
		);

		Core.dispatchEvent(new CoreUninstalledEvent);
	}

	export function init() {
		// console.log(StorageEntries)

		// if (!this.isInstalled())
		// 	this.install();
	}
}
