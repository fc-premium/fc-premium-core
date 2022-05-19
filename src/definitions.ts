const STORAGE_ENTRIES_ROOT = 'FC_PREMIUM';

export namespace StorageEntries {
	export const root: string = STORAGE_ENTRIES_ROOT;
	export const packages: string = `${STORAGE_ENTRIES_ROOT}/packages`;
	export const config: string = `${STORAGE_ENTRIES_ROOT}/config`;
	export const storage: string = `${STORAGE_ENTRIES_ROOT}/storage`;
}

// Prevent console methods beign replaced
const _console: Console = Object.freeze(Object.assign({}, window.console));

export const NO_CACHE_HEADERS = new Headers();
NO_CACHE_HEADERS.append('pragma', 'no-cache');
NO_CACHE_HEADERS.append('cache-control', 'no-cache');
NO_CACHE_HEADERS.append('Access-Control-Request-Headers', '*');

Object.freeze(NO_CACHE_HEADERS);
