import './scss/styles.scss';
import { ShopAPI } from './components/ShopAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
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

// цвет категории
const categoryClassMap = new Map<string, string>([
	['софт-скил', 'card__category_soft'],
	['дополнительное', 'card__category_additional'],
	['кнопка', 'card__category_button'],
	['хард-скил', 'card__category_hard'],
	['другое', 'card__category_other']
]);


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => {
				events.emit('card:click', item);
			},
		});

		const price = item.price !== null ? `${String(item.price)} синапсов` : "Бесценно";

		const categoryClass = categoryClassMap.get(item.category) || '';
		card.categoryClass = categoryClass;

		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			id: item.id,
			price: price
		});
	});
});

// Нажали на карточку
events.on('card:click', (item: ICard) => {
	const { ...params } = item;
	const modalContent = cloneTemplate(cardPreviewTemplate);
	modalContent.querySelector('.card__image').setAttribute('src', params.image);
	modalContent.querySelector('.card__image').setAttribute('alt', params.title);
	modalContent.querySelector('.card__category').textContent = params.category;
	modalContent.querySelector('.card__title').textContent = params.title;
	modalContent.querySelector('.card__text').textContent = params.description;
	const price = params.price !== null ? `${String(item.price)} синапсов` : "Бесценно";
	modalContent.querySelector('.card__price').textContent = price;

	const addButton = modalContent.querySelector('.card__button');
	if (addButton) {
		if (params.price !== null) {
			addButton.addEventListener('click', () => {
				events.emit('basket:add', item);
			});
		} else {
			(addButton as HTMLButtonElement).style.display = 'none';
		}
	}
	modal.content = modalContent;
	modal.open();
});

// Добавили карточку в корзину
events.on('basket:add', (item: ICard) => {
	appData.addToBasket(item);
	events.emit('basket:changed', item);
	modal.close();
});


// Изменения корзины
events.on('basket:changed', () => {
	page.counter = appData.basket.length;

	const basketList = ensureElement<HTMLUListElement>('.basket__list');
	const basketPrice = ensureElement<HTMLElement>('.basket__price');

	const basketItems = appData.getBasketItems();

	basketList.innerHTML = '';

	let total = 0;

	basketItems.forEach(item => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('basket:item:delete', item); //
			}
		});
		const price = item.price !== null ? `${String(item.price)} синапсов` : "Бесценно";
		basketItem.render({
			title: item.title,
			price: price,
		});

		basketList.appendChild(basketItem.getElement())
		total += item.price; //
	});

	basketPrice.textContent = `${total} синапсов`;
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

		const price = item.price !== null ? `${String(item.price)} синапсов` : "Бесценно";
		basketItem.render({
			title: item.title,
			price: price,
		});
		basketItem.index = `${index + 1}`;
		return basketItem.getElement();
	});

	basket.items = basketItemElements;
	basket.total = appData.getBasketTotal();

	modal.render({ content: basket.render() });

	const checkoutButton = modal.getContainer().querySelector('.modal__actions .basket__button');
	if (checkoutButton) {
		checkoutButton.addEventListener('click', () => {

			events.emit('basket:checkout');
		});
	}
	modal.open();
});

// Удаляем карточку из корзины
events.on('basket:item:delete', (itemToDelete: ICard) => {
	const index = appData.basket.findIndex(id => id === itemToDelete.id);
	if (index !== -1) {
		appData.basket.splice(index, 1);
		modal.close();
		page.counter = appData.basket.length;
		events.emit('basket:open');
	} else {
		console.error('Ошибка удаления товара из корзины: товар не найден');
	}
});

// Нажимаем в корзине "Оформить", отрывается форма оплаты
events.on('basket:checkout', () => {
	modal.render({ content: order.render({ valid: false, errors: [] }) });
	modal.open();
});

// Обрабатываем форму оплаты и контактов
events.on('order:contacts', (data: { payMethod: string, address: string }) => {
	// Сохраняем данные в appData.order
	appData.order.payment = data.payMethod;
	appData.order.address = data.address;

	modal.render({ content: contacts.render({ valid: false, errors: [] }) });
	modal.open();
});

// Собираем все данные из форм и отправляем на сервер
events.on('contacts:submit', (formData: { email: string, phone: string }) => {
	// Получаем элементы корзины
	const basketItems = appData.getBasketItems();
	const orderItems = basketItems.map(item => item.id);

	const basketTotal = appData.getBasketTotal();

	// Создаем объект типа IOrder и добавляем необходимые данные
	const orderData: IOrder = {
		email: formData.email,
		phone: formData.phone,
		payment: appData.order.payment,
		address: appData.order.address,
		items: orderItems,
		total: basketTotal,
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
