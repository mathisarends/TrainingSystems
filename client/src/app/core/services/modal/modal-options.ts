import { Injector } from '@angular/core';
import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { ModalSize } from './modalSize';
/**
 * Interface for modal options.
 */
export interface ModalOptions {
  /**
   * The Angular component to be displayed in the modal. Optional.
   */
  component?: any;

  /**
   * An array of tabs to be displayed in the modal. Optional.
   */
  tabs?: ModalTab[];

  /**
   * The title of the modal.
   */
  title: string;

  /**
   * Determines whether the modal's main action is destructive (e.g., delete).
   * If set to true, the modal will be styled accordingly. Optional.
   */
  isDestructiveAction?: boolean;

  /**
   * The text to display on the modal's primary button. Optional.
   */
  buttonText?: string;

  /**
   * The text to display on the modal's secondary button. Optional.
   */
  secondaryButtonText?: string;

  /**
   * The size of the modal. Optional.
   */
  size?: ModalSize;

  /**
   * Additional data to pass to the component. Optional.
   */
  componentData?: Record<string, unknown>;

  /**
   * Set to true if confirmation is required, e.g., when using form validation within a component. Optional.
   */
  confirmationRequired?: boolean;

  /**
   * Determines whether the modal has a footer. Optional.
   */
  hasFooter?: boolean;

  /**
   * A map of providers to be used within the modal. Optional.
   */
  providerMap?: Map<any, any>;

  /**
   * An optional Angular injector to be used in the modal. Optional.
   */
  injector?: Injector;

  /**
   * A callback function to be executed when the modal's primary action is triggered.
   * Can be synchronous or asynchronous. Optional.
   */
  onSubmitCallback?: () => Promise<void>;

  /**
   * A callback function to be executed when the modal's primary action is triggered.
   * Validates the user input
   */
  onValidateCallback?: () => true | string | void;
}
