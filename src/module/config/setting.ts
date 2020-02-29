export class Setting {
	public readonly key: string;
	private readonly defaultValue: any;
	private value: any;

	public constructor(key: string, defaultValue: any) {
		this.key = key;
		this.defaultValue = defaultValue;
		this.value = defaultValue;
	}

	getValue(): any {
		return this.value;
	}

	getDefaultValue(): any {
		return this.defaultValue;
	}

	setValue(value: any): void {
		this.value = value;
	}

	resetValue(): void {
		this.value = this.defaultValue;
	}
}
