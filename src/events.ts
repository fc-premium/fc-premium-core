export class CoreEvent<T = any> extends CustomEvent<T> {

	public propagationStopped: boolean = false;

	constructor(type: string, detail: T = null) {
		super(type, {
			detail,
			bubbles: true,
		});
	}

	public stopPropagation() {
		this.propagationStopped = true;
	}
}

interface CustomEventListener<T extends CoreEvent> {
	(evt: T): void;
}

interface CustomEventListenerObject<T extends CoreEvent> {
	handleEvent(object: T): void;
}

type CustomEventListenerCallback<T extends CoreEvent> = CustomEventListener<T> | CustomEventListenerObject<T>;

export class CoreTarget extends EventTarget {
	private parent: EventTarget | null;

	constructor(parent: EventTarget | null = null) {
		super();
		this.parent = parent
	}

	public dispatchEvent(event: CoreEvent): boolean {
		const result = super.dispatchEvent(event);

		if (this.parent !== null && event.propagationStopped === false)
			this.parent.dispatchEvent(event)

		return result;
	}

	public addEventListener<T extends Event>(type: string, callback: CustomEventListenerCallback<T> | null, options?: AddEventListenerOptions | boolean): void {
		return super.addEventListener(type, callback as unknown as EventListenerOrEventListenerObject | null, options);
	};

	public removeEventListener<T extends Event>(type: string, callback: CustomEventListenerCallback<T> | null, options?: EventListenerOptions | boolean): void {
		return super.removeEventListener(type, callback as unknown as EventListenerOrEventListenerObject | null, options);
	};
}

export namespace Events {
	export enum Types {
		Install = 'install',
		Uninstall = 'uninstall',

		Load = 'load',
		Unload = 'unload',
	}

	/** Event fired right after an object being installed */
	export class InstallEvent<T> extends CoreEvent<T> {
		constructor(detail: T) { super(Types.Install, detail) }
	}

	/** Event fired right after an object being uninstalled */
	export class UninstallEvent<T> extends CoreEvent<T> {
		constructor(detail: T) { super(Types.Uninstall, detail) }
	}

	/** Event fired right after an object being loaded */
	export class LoadEvent<T> extends CoreEvent<T> {
		constructor(detail: T) { super(Types.Load, detail) }
	}

	/** Event fired right after an object being unloaded */
	export class UnloadEvent<T> extends CoreEvent<T> {
		constructor(detail: T) { super(Types.Unload, detail) }
	}
}
