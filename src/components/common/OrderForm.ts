import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { IForm } from "../../types";

export class OrderForm extends Form<IForm> {

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        const cardButton = container.querySelector('button[name="card"]');
        const cashButton = container.querySelector('button[name="cash"]');
        if (cardButton && cashButton) {
            cardButton.addEventListener('click', () => {
                this.onButtonClick('payment', 'online');
            });
            
            cashButton.addEventListener('click', () => {
                this.onButtonClick('payment', 'offline');
            });
        }

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('order:contacts');
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: string) {
        const cardButton = this.container.querySelector('button[name="card"]') as HTMLButtonElement;
        const cashButton = this.container.querySelector('button[name="cash"]') as HTMLButtonElement;

        if (value === 'online') {
            cardButton.classList.add('button_alt-active');
            cashButton.classList.remove('button_alt-active');
        } else if (value === 'offline') {
            cashButton.classList.add('button_alt-active');
            cardButton.classList.remove('button_alt-active');
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