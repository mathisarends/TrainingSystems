import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { ModalSize } from './modalSize';
/**
 * Interface for modal options.
 */
export interface ModalOptions {
  /**
   * The Angular component to be displayed in the modal.
   */
  component: any;

  tabs?: ModalTab[];

  /**
   * The title of the modal.
   */
  title: string;

  /**
   * Determines whether the modal's main action is destructive (e.g., delete).
   * If set to true, the modal will be styled accordingly.
   * Optional.
   */
  isDestructiveAction?: boolean;

  /**
   * The text to display on the modal's button.
   */
  buttonText?: string;

  /**
   * The text to display on the modal's secondary button.
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
   * Auf true zu setzen, wenn man z.B. Formvalidierung innerhalb einer Komponente benutzen will
   */
  confirmationRequired?: boolean;

  hasFooter?: boolean;

  providerMap?: Map<any, any>;
}

export interface ModalTabOptions {
  tabs: ModalTab[];

  /**
   * The text to display on the modal's button.
   */
  continueButtonText?: string;

  /**
   * The size of the modal. Optional.
   */
  size?: ModalSize;

  /**
   * Auf true zu setzen, wenn man z.B. Formvalidierung innerhalb einer Komponente benutzen will
   */
  confirmationRequired?: boolean;

  providerMap: Map<any, any>;
}

/**
 * Interface for the basic info modal options, inheriting only specific properties from ModalOptions.
 */
export interface BasicInfoModalOptions
  extends Pick<ModalOptions, 'title' | 'buttonText' | 'isDestructiveAction' | 'hasFooter' | 'size'> {
  /**
   * The text message to display in the modal.
   */
  infoText: string;
}

export interface DeleteModalModalOptions extends BasicInfoModalOptions {
  deletionKeyWord: string;
}
