import { Model } from './base/Model';
import { FormErrors, IAppState, ICard, IOrder } from '../types';


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
		this.basket.push(item.id);
		this.emitChanges('basket:changed');
	}

	getBasketItems(): ICard[] {
		const basketItems = this.catalog.filter(item => this.basket.includes(item.id));
		return basketItems;
	}

	getBasketTotal(): number {
		return this.getBasketItems().reduce((total, item) => total + item.price, 0);
	}

}
