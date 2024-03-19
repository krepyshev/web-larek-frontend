export interface ICard {
	id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number;
}

export interface IForm {
	payment?: string;
	address?: string;
	email?: string;
	phone?: string;
	image?: string;
	title?: string;
	description?: string;
}


export interface IOrder extends IForm {
	items: string[];
	total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IModalData {
	content: HTMLElement;
}

export interface IOrderResult {
	id: string;
}

export interface IEvents {
	on(): void;
	emit(): void;
	trigger(): () => void;
}

export interface IShopAPI {
	getCardList: () => Promise<ICard[]>;
	getCardItem: () => Promise<ICard>;
	orderCards: () => Promise<IOrderResult>;
}

export interface IAppState {
	catalog: ICard[];
	basket: string[];
	order: IForm;
}

export type Category = {
	category: string;
};
