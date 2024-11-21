/**
 * Interface for the basic info modal options, inheriting only specific properties from ModalOptions.
 */
export interface BasicInfoModalOptions {
  /**
   * The title of the modal.
   */
  title: string;

  /**
   * The text to display on the modal's primary button. Optional.
   */
  buttonText?: string;

  /**
   * Determines whether the modal has a footer. Optional.
   */
  hasFooter?: boolean;

  /**
   * The text message to display in the modal.
   */
  infoText: string;

  /**
   * Determines whether the modal's main action is destructive (e.g., delete).
   * If set to true, the modal will be styled accordingly. Optional.
   */
  isDestructiveAction?: boolean;

  /**
   * A callback function to be executed when the modal's primary action is triggered.
   * Can be synchronous or asynchronous. Optional.
   */
  onSubmitCallback?: () => void | Promise<void>;
}
