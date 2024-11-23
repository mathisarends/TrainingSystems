import { BasicInfoModalOptions } from './basic-info-modal-options';

/**
 * Builder for creating `BasicInfoModalOptions` objects with a fluent API.
 */
export class BasicInfoModalOptionsBuilder {
  /**
   * Internal storage for the modal options being built.
   */
  protected options: Partial<BasicInfoModalOptions> = {};

  /**
   * Sets the title of the modal.
   */
  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  /**
   * Marks the modal's main action as destructive.
   */
  setIsDestructiveAction(isDestructive: boolean): this {
    this.options.isDestructiveAction = isDestructive;
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
   * Defines whether the modal has a footer.
   */
  setHasFooter(hasFooter: boolean): this {
    this.options.hasFooter = hasFooter;
    return this;
  }

  /**
   * Sets the informational text to display in the modal.
   */
  setInfoText(infoText: string): this {
    this.options.infoText = infoText;
    return this;
  }

  /**
   * Sets the callback function for the modal's primary action.
   */
  setOnSubmitCallback(callback: () => Promise<void>): this {
    this.options.onSubmitCallback = callback;
    return this;
  }

  /**
   * Builds the `BasicInfoModalOptions` object, ensuring required fields are set.
   */
  build(): BasicInfoModalOptions {
    if (!this.options.title) {
      throw new Error('The "title" field is required.');
    }
    if (!this.options.infoText) {
      throw new Error('The "infoText" field is required.');
    }
    return this.options as BasicInfoModalOptions;
  }
}
