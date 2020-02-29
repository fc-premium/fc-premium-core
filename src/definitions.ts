export class StorageEntries {
	public static root: string = 'FC_PREMIUM';
	public static packages: string = `${StorageEntries.root}/packages`;
	public static config: string = `${StorageEntries.root}/config`;
	public static storage: string = `${StorageEntries.root}/storage`;
}

// Prevent console methods beign replaced
const _console: Console = Object.freeze(Object.assign({}, window.console));

export const NO_CACHE_HEADERS = new Headers();
NO_CACHE_HEADERS.append('pragma', 'no-cache');
NO_CACHE_HEADERS.append('cache-control', 'no-cache');

Object.freeze(NO_CACHE_HEADERS);
