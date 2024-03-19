import { Form } from "./Form";
import { IForm } from "../../types";
import { IEvents } from "../base/events";

export class ContactsForm extends Form<IForm> {

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    container.addEventListener('submit', (event) => {
      event.preventDefault();

      const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
      const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement;

      const email = emailInput.value;
      const phone = phoneInput.value;


      const isValidEmail = this.validateEmail(email);
      const isValidPhone = this.validatePhone(phone);

      if (!isValidEmail || !isValidPhone) {
        console.error('Ошибка валидации: неверный формат электронной почты или номера телефона.');
      }

      const formData = {
        email: email,
        phone: phone,
      };

      events.emit('contacts:submit', formData);
    });

    container.addEventListener('input', () => {
      this.checkFormValidity();
    });
  }

  private checkFormValidity() {
    const submitButton = this.container.querySelector('button[type="submit"]') as HTMLButtonElement;

    const emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;

    if (this.validateEmail(emailInput.value) && this.validatePhone(phoneInput.value)) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return phoneRegex.test(phone);
  }
}
