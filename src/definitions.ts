export namespace StorageEntries {
	export const root: string = 'FC_PREMIUM';
	export const packages: string = `${StorageEntries.root}/packages`;
	export const config: string = `${StorageEntries.root}/config`;
	export const storage: string = `${StorageEntries.root}/storage`;
}

// Prevent console methods beign replaced
const _console: Console = Object.freeze(Object.assign({}, window.console));

export const NO_CACHE_HEADERS = new Headers();
NO_CACHE_HEADERS.append('pragma', 'no-cache');
NO_CACHE_HEADERS.append('cache-control', 'no-cache');
// NO_CACHE_HEADERS.append('Access-Control-Request-Headers', '*');

Object.freeze(NO_CACHE_HEADERS);
