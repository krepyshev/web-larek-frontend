import { Form } from "./Form";
import { IForm } from "../../types";
import { IEvents } from "../base/events";

export class OrderForm extends Form<IForm> {
  payment: string;
  address: string;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    this.payment = '';
    this.address = '';
    this.valid = false;

    container.addEventListener('input', () => {
      this.valid = this.validateForm();
      this.updateOrderData();
    });

    const nextButton = container.querySelector('.order__button') as HTMLButtonElement;
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        const isValid = this.validateForm();
        if (isValid) {
          events.emit('order:contacts', { payMethod: this.payment, address: this.address });
        } else {
          console.error('Форма не валидна');
        }
      });
    }

    const cardButton = container.querySelector('button[name="card"]');
    const cashButton = container.querySelector('button[name="cash"]');
    const addressInput = container.querySelector('input[name="address"]');
    if (cardButton && cashButton && addressInput) {
      cardButton.addEventListener('click', () => {
        this.selectPaymentMethod(cardButton as HTMLButtonElement, cashButton as HTMLButtonElement, 'online');
      });

      cashButton.addEventListener('click', () => {
        this.selectPaymentMethod(cashButton as HTMLButtonElement, cardButton as HTMLButtonElement, 'offline');
      });

      addressInput.addEventListener('input', (e: Event) => {
        const address = (e.target as HTMLInputElement).value;
        this.onAddressChange(address);
      });
    }
    this.valid = this.validateForm();
  }

  selectPaymentMethod(selectedButton: HTMLButtonElement, unselectedButton: HTMLButtonElement, method: string) {
    selectedButton.classList.add('button_alt-active');
    unselectedButton.classList.remove('button_alt-active');
    this.payment = method;
    this.updateOrderData();
  }

  private onAddressChange(address: string) {
    this.address = address;
    this.updateOrderData();
  }

  private updateOrderData() {
    this.events.emit('form:order:validate');
  }

  private validateForm(): boolean {
    return !!this.payment && this.address.trim().length > 0;
  }
}
