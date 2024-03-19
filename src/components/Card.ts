import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
	id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number | string;
}

export class Card<T> extends Component<ICard<T>> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _category?: HTMLElement;
	protected _price?: HTMLElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._image = container.querySelector('.card__image');
		this._category = container.querySelector('.card__category');
		this._button = container.querySelector(`.card__button`);
		this._price = container.querySelector('.card__price');

		if (actions?.onClick && this._button) {
			this._button.addEventListener('click', actions.onClick);
		}
		else if (actions?.onClick) {
			container.addEventListener('click', actions.onClick);
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set price(value: string) {
		this.setText(this._price, value);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	set categoryClass(value: string) {
		if (this._category) {
			this._category.classList.add(value);
		}
	}
}
