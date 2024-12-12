import { BottomSheetItem } from './bottom-sheet-item';

// TODO: eigentlich muss diese Komponente nicht komplett dynamisch sein (also keine content-injection) sondern sie muss einfach nur ein array solcehr items hier darstellen können
// die dann jeweils über click listener das hier zusammenbrignen
// Kleiens Builder-Pattern auch hierfür machen und dann .show() aufrufen am ende im service oder nicht?
export interface ButtonSheetOptions {
  items: BottomSheetItem[];
}
