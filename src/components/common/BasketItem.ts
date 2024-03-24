import { Card, ICardActions } from '../Card';
import { ensureElement } from '../../utils/utils';

export class BasketItem<T> extends Card<T> {
    protected _deleteButton?: HTMLButtonElement;
    protected _index?: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);

        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
        if (actions?.onClick && this._deleteButton) {
            this._deleteButton.addEventListener('click', actions.onClick);
        }

        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }

    set index(value: string) {
        this.setText(this._index, value);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    getElement(): HTMLElement {
        return this.container;
    }
}
