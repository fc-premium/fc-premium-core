import * as _Controller from './controller'
import * as _LibraryHandler from './library-handler'
import * as _ModuleHandler from './module-handler'
import * as _ConfigHandler from './config-handler'
import * as _Module from './module'
import * as _Definitions from './definitions'

import { CoreTarget, Events } from './events'

import StorageEntries = _Definitions.StorageEntries;

export const core_event_target = new CoreTarget();

export namespace Core {

	export import Definitions = _Definitions;
	export import Controller = _Controller.Controller;
	export import LibraryHandler = _LibraryHandler.LibraryHandler;
	export import libraries = _LibraryHandler.LibraryHandler;
	export import ConfigHandler = _ConfigHandler.ConfigHandler;
	export import ModuleHandler = _ModuleHandler.ModuleHandler;
	export import Module = _Module.Module;

	export const addEventListener: EventTarget['addEventListener'] = core_event_target.addEventListener.bind(core_event_target);
	export const removeEventListener: EventTarget['removeEventListener'] = core_event_target.removeEventListener.bind(core_event_target);
	export const dispatchEvent: EventTarget['dispatchEvent'] = core_event_target.dispatchEvent.bind(core_event_target);


	export function isInstalled(): boolean {
		return Core.Controller.list().includes(StorageEntries.root)
	}

	export function install(): void {
		console.log('Core: Install');

		Core.Controller.set(StorageEntries.root, true);
		Core.Controller.set(StorageEntries.packages, {});
		Core.Controller.set(StorageEntries.config, {});
		Core.Controller.set(StorageEntries.storage, {});

		Core.dispatchEvent(new Events.InstallEvent(Core));
	}

	export function uninstall(): void {
		console.log('Core: Uninstall');

		Object.values(StorageEntries).forEach(key =>
			Core.Controller.delete(key)
		);

		Core.dispatchEvent(new Events.UninstallEvent(Core));
	}

	export function init() {
		if (!this.isInstalled())
			this.install();
	}
}
