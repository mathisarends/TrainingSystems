import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { ModalOptions } from './modal-options';
import { ModalSize } from './modalSize';

export class ModalOptionsBuilder<T extends ModalOptions = ModalOptions> {
  /**
   * Base configuration for the modal options.
   */
  private options: ModalOptions = {
    component: null,
    title: '',
    providerMap: new Map(),
    size: ModalSize.MEDIUM,
    hasFooter: true,
    confirmationRequired: false,
    isDestructiveAction: false,
  };

  /**
   * Sets the component to be displayed in the modal.
   */
  setComponent(component: any): this {
    this.options.component = component;
    return this;
  }

  /**
   * Sets the title of the modal.
   */
  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  /**
   * Sets the tabs to be displayed in the modal.
   */
  setTabs(tabs: ModalTab[]): this {
    this.options.tabs = tabs;
    return this;
  }

  /**
   * Sets the provider map for dependencies.
   */
  setProviderMap(providerMap: Map<any, any>): this {
    this.options.providerMap = providerMap;
    return this;
  }

  /**
   * Sets the text for the primary button.
   */
  setButtonText(buttonText: string): this {
    this.options.buttonText = buttonText;

    return this;
  }

  /**
   * Sets the text for the secondary button.
   */
  setAlternativeButtonText(buttonText: string): this {
    this.options.secondaryButtonText = buttonText;
    return this;
  }

  /**
   * Sets the size of the modal.
   */
  setSize(size: ModalSize): this {
    this.options.size = size;
    return this;
  }

  /**
   * Sets additional data for the component.
   */
  setComponentData(data: Record<string, unknown>): this {
    this.options.componentData = data;
    return this;
  }

  /**
   * Marks the action as destructive.
   */
  setIsDestructiveAction(isDestructive: boolean): this {
    this.options.isDestructiveAction = isDestructive;
    return this;
  }

  /**
   * Defines whether the modal has a footer.
   */
  setHasFooter(hasFooter: boolean): this {
    this.options.hasFooter = hasFooter;
    return this;
  }

  setOnSubmitCallback(onSubmitCallback: () => void | Promise<void>) {
    this.options.onSubmitCallback = onSubmitCallback;
    return this;
  }

  /**
   * Builds the modal options and validates that at least a component or a tab group is defined.
   */
  build(): T {
    if (!this.options.component && !this.options.tabs) {
      throw new Error('Component or tab group.');
    }

    return this.options as T;
  }
}
