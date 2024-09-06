import { ModalSize } from './modalSize';
/**
 * Interface for modal options.
 */
export interface ModalOptions {
  /**
   * The Angular component to be displayed in the modal.
   */
  component: any;

  /**
   * The title of the modal.
   */
  title: string;

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
  /**
   * Additional data to pass to the component. Optional.
   */
  componentData?: Record<string, unknown>;

  /**
   * The minimum height of the modal in pixels. Optional.
   */
  minHeight?: number;

  /**
   * Auf true zu setzen, wenn man z.B. Formvalidierung innerhalb einer Komponente benutzen will
   */
  confirmationRequired?: boolean;

  hasFooter?: boolean;
}
