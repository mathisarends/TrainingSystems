import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { BasicInfoModalOptions, DeleteModalModalOptions, ModalOptions } from './modal-options';
import { ModalSize } from './modalSize';

export class ModalOptionsBuilder<T extends ModalOptions = ModalOptions> {
  private options: ModalOptions = {
    component: null,
    title: '',
    providerMap: new Map(),
    size: ModalSize.MEDIUM,
    hasFooter: true,
    confirmationRequired: false,
    isDestructiveAction: false,
  };

  setComponent(component: any): this {
    this.options.component = component;
    return this;
  }

  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  setTabs(tabs: ModalTab[]): this {
    this.options.tabs = tabs;
    return this;
  }

  setProviderMap(providerMap: Map<any, any>): this {
    this.options.providerMap = providerMap;
    return this;
  }

  setButtonText(buttonText: string): this {
    this.options.buttonText = buttonText;

    return this;
  }

  setAlternativeButtonText(buttonText: string): this {
    this.options.secondaryButtonText = buttonText;
    return this;
  }

  setSize(size: ModalSize): this {
    this.options.size = size;
    return this;
  }

  setComponentData(data: Record<string, unknown>): this {
    this.options.componentData = data;
    return this;
  }

  setIsDestructiveAction(isDestructive: boolean): this {
    this.options.isDestructiveAction = isDestructive;
    return this;
  }

  setHasFooter(hasFooter: boolean): this {
    this.options.hasFooter = hasFooter;
    return this;
  }

  setInfoText(infoText: string): this {
    if ('infoText' in this.options) {
      (this.options as BasicInfoModalOptions).infoText = infoText;
    }
    return this;
  }

  setDeletionKeyword(deletionKeyword: string): this {
    if ('deletionKeyWord' in this.options) {
      (this.options as DeleteModalModalOptions).deletionKeyWord = deletionKeyword;
    }
    return this;
  }

  build(): T {
    if (!this.options.component && !this.options.tabs) {
      throw new Error('Component or tab group.');
    }

    return this.options as T;
  }
}
