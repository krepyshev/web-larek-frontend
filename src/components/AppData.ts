import { Model } from './base/Model';
import { FormErrors, IAppState, ICard, IOrder, IForm } from '../types';

export type CatalogChangeEvent = {
	catalog: ICard[];
};

export class AppState extends Model<IAppState> {
	basket: string[] = [];
	catalog: ICard[];
	loading: boolean;
	order: IOrder = {
		email: '',
		phone: '',
		payment: '',
		address: '',
		items: [],
		total: 0
	};
	preview: string | null;
	formErrors: FormErrors = {};

	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	setCatalog(items: ICard[]) {
		this.catalog = items;
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: ICard) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	clearBasket() {
		this.order.items.forEach((id) => { });
		this.basket = [];
	}

	addToBasket(item: ICard): void {
		if (!this.basket.includes(item.id)) {
			this.basket.push(item.id);
			this.events.emit('basket:changed', item);
		}
	}

	getBasketItems(): ICard[] {
		const basketItems = this.catalog.filter(item => this.basket.includes(item.id));
		return basketItems;
	}

	getBasketTotal(): number {
		return this.getBasketItems().reduce((total, item) => total + item.price, 0);
	}

	isInBasket(itemId: string): boolean {
		return this.basket.includes(itemId);
	}

	setOrderField(field: keyof IForm, value: string) {
		this.order[field] = value;
		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	setContactsField(field: keyof IForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

}
