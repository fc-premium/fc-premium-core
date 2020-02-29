Object.defineProperty(Config, 'HTML', {
	get: () => ({
		INPUT: {
			GETTER: (value: any, attr: Object = {}) => {
				let html = $('<input>');
				(<HTMLInputElement>html[0]).value = value;

				Object.entries(attr).forEach(([key, value]) => {
					html[0].setAttribute(key, <string>value);
				});

				return html;
			},

			PARSER: (el: JQuery) => el.find('input').val()
		},

		TEXTAREA: {
			GETTER: (value: any, attr: Object = {}) => {
				let html = $('<textarea>');
				(<HTMLInputElement>html[0]).value = value;

				Object.entries(attr).forEach(([key, value]) => {
					html[0].setAttribute(key, <string>value);
				});

				return html;
			},

			PARSER: (el: JQuery) => el.find('textarea').val()
		},

		SELECT: {
			GETTER: (options: Array<string> = [], selectedIndex: number = 0, attr: Object = {}) => {
				let html = $('<select>');

				selectedIndex = selectedIndex >= options.length ?
					options.length - 1 : selectedIndex;

				options.forEach((option, i) => {
					let opt = $('<option>');
					opt[0].setAttribute('value', i.toString());
					opt[0].innerText = option;
					html.append(opt);
				});

				Object.entries(attr).forEach(([key, value]) => {
					html[0].setAttribute(key, <string>value);
				});

				html.find('option')[selectedIndex % options.length].setAttribute('selected', '');

				return html;
			},

			PARSER: (el: JQuery) =>
				(<HTMLSelectElement>el.find('select')[0]).selectedIndex
		},

		SWITCH: {
			GETTER: (state: boolean = false) => {
				// generate 'unique' id
				let id = performance.now();
				let html = $(`<input class="toogle" type="checkbox" id="${id}"><label class="toogle" for="${id}">Toggle</label>`);

				(<HTMLInputElement>html[0]).checked = state;

				return html;
			},

			PARSER: (el: JQuery) =>
				(<HTMLInputElement>el.find('input')[0]).checked
		},

		HOTKEY: {
			GETTER: (key: string, filterfunc: Function = null) => {
				let input = Config.HTML.INPUT.GETTER(key, {
					type: 'text',
					class: 'fancy-input disabled mousetrap hotkey',
					readonly: true,
				});

				let me = null;

				let readingKeystroke = false;

				function mousetrapKeyReader() {

					let self = this;

					if (me === null) {
						if (typeof Mousetrap !== 'function') {
							var Mousetrap = (a: any) => { this.a = a };
						}

						me = new Mousetrap(this);
					}

					readingKeystroke = true;

					self.classList.remove('disabled');

					this.addEventListener('blur', function() {
						readingKeystroke = false;
						self.classList.add('disabled');

					});

					me.handleKey = function(key: string, mods: Array<string>, ev: KeyboardEvent) {
						ev.preventDefault();
						ev.stopPropagation();

						if (readingKeystroke == true && ev.type == 'keydown' && ev.repeat === false) {
							if (key.length == 1) {

								let hotkey = Array.from(
									new Set([...mods.reverse(), key])
								).join('+').toLowerCase();

								if (typeof filterfunc == 'function') {
									if (filterfunc(key, mods, ev) === false) {
										return false;
									}
								}

								readingKeystroke = false;

								self.classList.add('disabled');
								self.value = hotkey;

							} else if (key === 'esc') {
								readingKeystroke = false;
								self.classList.add('disabled');
							}
						}
					}
				}

				// TODO: use config event handler in the future

				// remove event if exists
				try {
					let event = $.data(document, "events")
						.click.filter((ev: { selector: string }) =>
							ev.selector == '.fancy-input.mousetrap.hotkey'
						)[0];

					$(document).off(event.origType, event.selector, event.handler);

				} catch (e) { }

				$(document).on('click', '.fancy-input.mousetrap.hotkey', mousetrapKeyReader);

				return input;
			},

			PARSER: (el: JQuery) => (<HTMLInputElement>el.find('input')[0]).value
		},

		COLOR: {
			GETTER: (value: any, attr: Object = {}) => {
				let html = $('<input type="color">');
				(<HTMLInputElement>html[0]).value = value;

				Object.entries(attr).forEach(([key, value]) => {
					html[0].setAttribute(key, <string>value);
				});

				return html;
			},

			PARSER: (el: JQuery) => Config.HTML.INPUT.PARSER(el)
		},

		BUTTON: {
			GETTER: (value: any, attr: Object = {}) => {
				let html = $('<input type="button">');
				(<HTMLInputElement>html[0]).value = value;

				Object.entries(attr).forEach(([key, value]) => {
					html[0].setAttribute(key, <string>value);
				});

				return html;
			}
		}
	})
});



Object.defineProperty(Config, 'DEFAULT_CONFIG', {
	get: () => ([
		['ENABLED', {
			title: 'Enabled',
			defaultValue: true,
			flags: ['CONFIGURABLE'],

			getter: function() {
				return Config.HTML.SWITCH.GETTER(this.value);
			},

			parser: function(element: HTMLElement) {
				let lastValue = this.value;
				let value = Config.HTML.SWITCH.PARSER(element);

				if (lastValue !== value) {
					// Pre set value
					this.value = value;

					if (value) {
						this.hostModule.load(false);
					} else {
						this.hostModule.unload();
					}
				}

				return value;
			}
		}],

		['DEBUG_MODE', {
			title: 'Debug Mode',
			defaultValue: false,
			flags: ['CONFIGURABLE'],

			section: 'Debug',

			getter: function() {
				return Config.HTML.SWITCH.GETTER(this.value);
			},

			parser: Config.HTML.SWITCH.PARSER,

			events: {
				HTMLAppended: function(meta: MetaConfig, el: HTMLElement) {
					const toogle = $(el).find('input')[0];

					toogle.addEventListener('change', function() {
						meta.value = (<HTMLInputElement>this).checked
					});
				}
			}
		}],

		['DEBUG_MODULE_NAME', {
			title: 'Show module name',
			value: true,
			defaultValue: true,
		}]
	])
});
