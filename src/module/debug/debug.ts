import { Module } from '../module'

/**
 * Implements an interface to the console api
 * @param module module reference from to get the configuration
 */

/* // TODO:
	colors:

	const clog = (a, b = "") => {
	let c = "",
		d = "";
	"err" === b ? (c = "red", d = "[x]") :
		"warn" === b ? (c = "darkorange", d = "[!]") :
		"info" === b ? (c = "dodgerblue", d = "[i]") :
		"ok" === b ? (c = "forestgreen", d = "[+]") :
		c = "black";
	console.log("%c" + d + " " + a, "color:" + c);
};

 */
export class Debug {

	private readonly hostModule: Module;

	constructor(module: Module) {
		this.hostModule = module;
	}

	log(...args: any[]): void {
		// if (this.hostModule.config.get('DEBUG_MODE') !== true)
		// 	return;

		// if (this.hostModule.config.get('DEBUG_MODULE_NAME') === true)
		// 	args = [`[${this.hostModule.name}]`, ...args];

		console.log(...args);
	}

	info(...args: any[]): void {
		// if (this.hostModule.config.get('DEBUG_MODE') !== true)
		// 	return;

		// if (this.hostModule.config.get('DEBUG_MODULE_NAME') === true)
		// 	args = [`[${this.hostModule.name}]`, ...args];

		console.info(...args);
	}

	warn(...args: any[]): void {
		// if (this.hostModule.config.get('DEBUG_MODE') !== true)
		// 	return;

		// if (this.hostModule.config.get('DEBUG_MODULE_NAME') === true)
		// 	args = [`[${this.hostModule.name}]`, ...args];

		console.warn(...args);

	}

	error(...args: any[]): void {
		// if (this.hostModule.config.get('DEBUG_MODE') !== true)
		// 	return;

		// if (this.hostModule.config.get('DEBUG_MODULE_NAME') === true)
		// 	args = [`[${this.hostModule.name}]`, ...args];

		console.error(...args);
	}

	alert(arg: any): void {
		// if (this.hostModule.config.get('DEBUG_MODE') !== true)
		// 	return;

		// if (this.hostModule.config.get('DEBUG_MODULE_NAME') === true)
		// 	arg = `[${this.hostModule.name}] ${arg}`;

		alert(arg);
	}
}
