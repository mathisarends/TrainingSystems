import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  EnvironmentInjector,
  createComponent,
  ComponentRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { ModalEventsService } from '../../modal-events.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'Default Title';
  @Input() confirmButtonText: string = 'Submit';

  @Input() childComponentType!: any;
  @ViewChild('modalContent', { read: ViewContainerRef })
  modalContent!: ViewContainerRef;

  private childComponentRef!: ComponentRef<any>;

  constructor(
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private environmentInjector: EnvironmentInjector
  ) {}

  ngOnInit() {}

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
    }
  }

  close() {
    this.modalService.close();
  }

  confirm() {
    this.modalEventsService.emitConfirmClick();
    this.close();
  }
}
