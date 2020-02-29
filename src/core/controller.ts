export namespace Controller {
	export interface ControllerMethods {
		getter: (keys: string | string[]) => any;
		setter: (key: string, value: any) => void;
		deleter: (key: string) => void;
		lister: (key: string) => string[];
	}
}

export class Controller {

	private methods: Controller.ControllerMethods = null;

	public get(keys: string | string[]): any {
		return this.methods.getter.apply(null, arguments);
	}

	public set(key: string, value: any): void {
		return this.methods.setter.apply(null, arguments);
	}

	public delete(key: string): void {
		return this.methods.deleter.apply(null, arguments);
	}

	public list(): string[] {
		return this.methods.lister.apply(null);
	}

	public setControllerMethods(methods: Controller.ControllerMethods) {
		this.methods = methods;
	}
}
