import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { IForm } from "../../types";

export class ContactsForm extends Form<IForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.onSubmit();
        });
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    private onSubmit() {
        const formData = new FormData(this.container);
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        this.events.emit('contacts:submit', { phone, email });
    }
}
