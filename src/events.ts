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

/*

class InstallEvent extends CustomEvent<void> {
    constructor() {
	super('install', {
	    bubbles: true,
	});
    }
}


class God extends EventTarget {
    [Symbol.toStringTag]() {
	return 'God'
    }
}


class CoreTarget extends EventTarget {
    constructor(private parent: EventTarget | null = null) {
	super();
    }

    public dispatchEvent(event: Event): boolean {
	const result = super.dispatchEvent(event);

	if (this.parent !== null && event.cancelBubble === false)
	    this.parent.dispatchEvent(event)

	return result;
    }

    [Symbol.toStringTag]() {
	return 'Core'
    }
}

const god = new God();
god.addEventListener('install', function() {
    console.log('Hm yes, i am god', event)
})
namespace Core {

    const __event_target = new CoreTarget(god);

	export const addEventListener: EventTarget['addEventListener'] = __event_target.addEventListener.bind(__event_target);
	export const removeEventListener: EventTarget['removeEventListener'] = __event_target.removeEventListener.bind(__event_target);
	export const dispatchEvent: EventTarget['dispatchEvent'] = __event_target.dispatchEvent.bind(__event_target);

    export function install() {
	console.log('Install')
	const event = new InstallEvent;
	__event_target.dispatchEvent(event)
    }

}

Core.addEventListener('install', function(event) {
    console.log('Posainstalao', event)
})

console.log(Core)
Core.install()

*/