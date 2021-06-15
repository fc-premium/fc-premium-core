export enum EventTypes {
	CoreInstalled = 'coreinstalled',
	CoreUninstalled = 'coreuninstalled',
}

export class CoreInstalledEvent extends CustomEvent<void> {
	constructor() { super(EventTypes.CoreInstalled) }
}

export class CoreUninstalledEvent extends CustomEvent<void> {
	constructor() { super(EventTypes.CoreUninstalled) }
}