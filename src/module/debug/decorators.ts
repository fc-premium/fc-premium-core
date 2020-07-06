import { Debug } from './debug'

export function DebugLock(target: Debug, { }, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;

	if (target instanceof Debug && originalMethod.constructor.name == 'AsyncFunction') {
		descriptor.value = async function(...args: any[]) {
			this.__currentPromise = originalMethod.apply(this, ...args);

			await this.__currentPromise;
			this.__currentPromise = null;
		};
	}
}
