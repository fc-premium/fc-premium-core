export namespace Controller {
	export interface ControllerMethods {
		getter: (keys: string | string[]) => any;
		setter: (key: string, value: any) => void;
		deleter: (key: string) => void;
		lister: (key: string) => string[];
	}
}

let __methods: Controller.ControllerMethods = null;

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

	public static setControllerMethods(methods: Controller.ControllerMethods) {
		__methods = methods;
	}
}
