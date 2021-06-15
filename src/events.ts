export namespace Events {
	export enum Types {
		Install = 'install',
		Uninstall = 'uninstall',

		Load = 'load',
		Unload = 'load',
	}

	/** Event fired right after an object being installed */
	export class InstallEvent extends CustomEvent<void> {
		constructor() { super(Types.Install) }
	}

	/** Event fired right after an object being uninstalled */
	export class UninstallEvent extends CustomEvent<void> {
		constructor() { super(Types.Uninstall) }
	}

	/** Event fired right after an object being loaded */
	export class LoadEvent extends CustomEvent<void> {
		constructor() { super(Types.Load) }
	}

	/** Event fired right after an object being unloaded */
	export class UnloadEvent extends CustomEvent<void> {
		constructor() { super(Types.Unload) }
	}
}