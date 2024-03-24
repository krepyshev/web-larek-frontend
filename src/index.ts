import './scss/styles.scss';
import { ShopAPI } from './components/ShopAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { AppState } from './components/AppData';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Card } from './components/Card';
import { CatalogChangeEvent } from './components/AppData';
import { ICard, IOrder, IOrderResult } from './types';
import { BasketItem } from './components/common/BasketItem';
import { OrderForm } from './components/common/OrderForm';
import { ContactsForm } from './components/common/ContactsForm';
import { Success } from './components/common/Success';
import { IForm } from './types';


const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);


// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);


// Дальше идет бизнес-логика

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => {
				events.emit('card:click', item);
			},
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			id: item.id,
			price: item.price
		});
	});
});

// Нажали на карточку
events.on('card:click', (item: ICard) => {
	appData.setPreview(item);
})

// Изменения превью карточки
events.on('preview:changed', (item: ICard) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('basket:add', item);
		}
	});

	card.setInBasket(appData.isInBasket(item.id));

	const modalContent = card.render({
		title: item.title,
		image: item.image,
		description: item.description,
		price: item.price,
		category: item.category
	});

	modal.render({
		content: modalContent
	});

	modal.open();
});

// Добавили карточку в корзину
events.on('basket:add', (item: ICard) => {
	appData.addToBasket(item);
	modal.close();
});

// Изменения корзины
events.on('basket:changed', () => {
	page.counter = appData.basket.length;

	const basketList = ensureElement<HTMLUListElement>('.basket__list');

	const basketItems = appData.getBasketItems();

	basketList.innerHTML = '';

	basketItems.forEach(item => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('basket:item:delete', item);
			}
		});

		basketItem.render({
			title: item.title,
			price: item.price,
		});

		basketList.appendChild(basketItem.getElement())
	});

	const total = appData.getBasketTotal();
	basket.total = total;
});

// Открываем корзину
events.on('basket:open', () => {
	const basketItems = appData.getBasketItems();
	const basketItemElements: HTMLElement[] = basketItems.map((item, index) => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('basket:item:delete', item);
			}
		});

		basketItem.render({
			title: item.title,
			price: item.price,
		});
		basketItem.index = `${index + 1}`;
		return basketItem.getElement();
	});

	basket.items = basketItemElements;

	modal.render({ content: basket.render() });

	const checkoutButton = modal.getContainer().querySelector('.modal__actions .basket__button');
	if (checkoutButton) {
		checkoutButton.addEventListener('click', () => {
			events.emit('basket:checkout');
		});
	}

	modal.open();
});


// Удаляем карточку из корзины и обновляем сумму корзины
events.on('basket:item:delete', (itemToDelete: ICard) => {
	const index = appData.basket.findIndex(id => id === itemToDelete.id);
	if (index !== -1) {
		appData.basket.splice(index, 1);
		modal.close();
		page.counter = appData.basket.length;

		const total = appData.getBasketTotal();
		basket.total = total;

		events.emit('basket:open');
	} else {
		console.error('Ошибка удаления товара из корзины: товар не найден');
	}
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IForm>) => {
	const { payment, address, email, phone } = errors;
	order.valid = !payment && !address;
	contacts.valid = !email && !phone;
	order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
	contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IForm, value: string }) => {
	appData.setOrderField(data.field, data.value);
});

// Изменилось одно из полей
events.on(/^contacts\..*:change/, (data: { field: keyof IForm, value: string }) => {
	appData.setContactsField(data.field, data.value);
});

// Нажимаем в корзине "Оформить", отрывается форма оплаты
events.on('basket:checkout', () => {
	modal.render({ content: order.render({ valid: false, errors: [] }) });
	modal.open();
});


// Обрабатываем форму контактов
events.on('order:contacts', () => {
	modal.render({ content: contacts.render({ valid: false, errors: [] }) });
	modal.open();
});


// Собираем все данные из форм и отправляем на сервер
events.on('contacts:submit', (formData: { email: string, phone: string }) => {
	const basketItems = appData.getBasketItems();
	const orderItems = basketItems.map(item => item.id);

	const basketTotal = appData.getBasketTotal();

	const orderData: IOrder = {
		email: formData.email,
		phone: formData.phone,
		payment: appData.order.payment,
		address: appData.order.address,
		items: orderItems,
		total: basketTotal
	};

	// Отправляем данные на сервер
	api.orderCards(orderData)
		.then((result: IOrderResult) => {
			const success = new Success(cloneTemplate(successTemplate), orderData, {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					page.counter = appData.basket.length;
					events.emit('basket:changed');
				},
			});

			modal.render({
				content: success.render({}),
			});
		})
		.catch((error: Error) => {
			console.error('Ошибка при отправке заказа:', error);
		});
});


// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем лоты с сервера
api
	.getCardList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
