import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IOrder } from "../../types";

interface ISuccess {
  total: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected _close: HTMLElement;

  constructor(container: HTMLElement, private orderData: IOrder, actions: ISuccessActions) {
    super(container);

    const descriptionElement = ensureElement<HTMLElement>('.order-success__description', this.container);
    descriptionElement.textContent = `Списано ${this.orderData.total} синапсов`;

    this._close = ensureElement<HTMLElement>('.order-success__close', this.container);

    if (actions?.onClick) {
      this._close.addEventListener('click', actions.onClick);
    }
  }
}