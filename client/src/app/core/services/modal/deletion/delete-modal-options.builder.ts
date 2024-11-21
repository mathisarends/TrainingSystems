import { BasicInfoModalOptionsBuilder } from '../basic-info/basic-info-modal-options-builder';
import { DeleteModalModalOptions } from './delete-modal-options';

/**
 * Builder for creating `DeleteModalModalOptions` objects, extending the basic info modal builder.
 */
export class DeleteModalOptionsBuilder extends BasicInfoModalOptionsBuilder {
  /**
   * Sets the deletion keyword required for confirming the delete action.
   */
  setDeletionKeyword(keyword: string): this {
    (this.options as Partial<DeleteModalModalOptions>).deletionKeyWord = keyword;
    return this;
  }

  /**
   * Builds the `DeleteModalModalOptions` object, ensuring all required fields are set.
   */
  override build(): DeleteModalModalOptions {
    const options = super.build() as DeleteModalModalOptions;

    if (!options.deletionKeyWord) {
      throw new Error('The "deletionKeyWord" field is required for a delete modal.');
    }

    return options;
  }
}
