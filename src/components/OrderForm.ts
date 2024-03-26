import { Form } from "./common/Form";
import { IEvents } from "./base/Events";
import { IForm } from "../types";

export class OrderForm extends Form<IForm> {
    private cardButton: HTMLButtonElement;
    private cashButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.cardButton = container.querySelector('button[name="card"]');
        this.cashButton = container.querySelector('button[name="cash"]');
        if (this.cardButton && this.cashButton) {
            this.cardButton.addEventListener('click', () => {
                this.onButtonClick('payment', 'online');
            });

            this.cashButton.addEventListener('click', () => {
                this.onButtonClick('payment', 'offline');
            });
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: string) {
        if (value === 'online') {
            this.toggleClass(this.cardButton, 'button_alt-active', true);
            this.toggleClass(this.cashButton, 'button_alt-active', false);
        } else if (value === 'offline') {
            this.toggleClass(this.cashButton, 'button_alt-active', true);
            this.toggleClass(this.cardButton, 'button_alt-active', false);
        }
    }

    protected onButtonClick(field: keyof IForm, value: string) {
        this.events.emit(`${this.container.name}.${String(field)}:change`, {
            field,
            value
        });
        this.payment = value;
    }

}