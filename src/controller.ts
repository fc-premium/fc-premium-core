export namespace Controller {
	export interface ControllerMethods {
		getter: (keys: string | string[]) => any;
		setter: (key: string, value: any) => void;
		deleter: (key: string) => void;
		lister: (key: string) => string[];
	}
}

const METHOD_NAMES: readonly (keyof Controller.ControllerMethods)[] = [
	'getter', 'setter',
	'deleter', 'lister'
];

const DEFAULT_METHODS: Controller.ControllerMethods = {
	getter: (keys: string | string[]) => { },
	setter: (key: string, value: any) => { },
	deleter: (key: string) => { },
	lister: (key: string) => { return [] },
};

const __methods: Controller.ControllerMethods = DEFAULT_METHODS;

export class Controller {
	/*A class for controlling storage*/
	public static get(keys: string | string[]): any {
		return __methods.getter.apply(null, arguments);
	}

	public static set(key: string, value: any): void {
		return __methods.setter.apply(null, arguments);
	}

	public static delete(key: string): void {
		return __methods.deleter.apply(null, arguments);
	}

	public static list(): string[] {
		return __methods.lister.apply(null);
	}

	public static setControllerMethods(methods_to_update: Partial<Controller.ControllerMethods>) {
		for (const method_name of METHOD_NAMES) {
			if (typeof methods_to_update[method_name] === 'function')
				__methods[method_name] = methods_to_update[method_name] as never;
		}
	}
}
