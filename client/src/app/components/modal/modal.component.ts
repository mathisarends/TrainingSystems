import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  EnvironmentInjector,
  createComponent,
  ComponentRef,
} from '@angular/core';
import { ModalService } from '../../../service/modal/modalService';
import { ModalSize } from '../../../service/modal/modalSize';
import { ModalEventsService } from '../../../service/modal/modal-events.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit {
  @Input() title: string = 'Default Title';
  @Input() confirmButtonText: string = 'Submit';
  @Input() childComponentType!: any;
  @Input() childComponentData: any;
  @Input() size: ModalSize = ModalSize.MEDIUM;
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;
  childComponentRef!: ComponentRef<any>;

  constructor(
    private environmentInjector: EnvironmentInjector,
    private modalService: ModalService,
    private modalEventService: ModalEventsService
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
    this.modalEventService.emitAbortClick();
    this.modalService.close();
  }

  confirm() {
    if (this.childComponentRef.instance.onSubmit) {
      this.childComponentRef.instance.onSubmit();
    }
  }
}
