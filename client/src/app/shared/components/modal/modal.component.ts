import {
  AfterViewInit,
  Component,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  createComponent,
} from '@angular/core';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit {
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @Input() title: string = 'Default Title';
  @Input() isDestructiveAction: boolean = false;
  @Input() secondaryButtonText: string = '';
  @Input() confirmButtonText: string = 'Bestätigen';
  @Input() childComponentType!: any;
  @Input() childComponentData: any;
  @Input() size: ModalSize = ModalSize.MEDIUM;
  @Input() footer: boolean = false;
  @Input() confirmationRequired = true;
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;
  childComponentRef!: ComponentRef<any>;

  constructor(
    private environmentInjector: EnvironmentInjector,
    private modalService: ModalService,
  ) {}

  ngAfterViewInit() {
    this.loadChildComponent();
  }

  loadChildComponent() {
    if (this.childComponentType) {
      this.childComponentRef = createComponent(this.childComponentType, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.modalContent.injector,
      });
      this.modalContent.insert(this.childComponentRef.hostView);

      // Pass data to the child component
      if (this.childComponentData) {
        Object.keys(this.childComponentData).forEach((key) => {
          this.childComponentRef.instance[key] = this.childComponentData[key];
        });
      }
    }
  }

  close() {
    this.cancelled.emit();
    this.modalService.close();
  }

  confirm() {
    if (this.childComponentRef.instance.onSubmit) {
      this.childComponentRef.instance.onSubmit();
    }

    if (!this.confirmationRequired) {
      this.modalService.close();
    }

    this.confirmed.emit();
  }

  secondaryButtonClick() {
    if (this.childComponentRef.instance.onSecondaryButtonClick) {
      this.childComponentRef.instance.onSecondaryButtonClick();
    }
  }
}