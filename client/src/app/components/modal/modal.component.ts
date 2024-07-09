import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { ModalService } from '../../../service/modalService';

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

  constructor(
    private modalService: ModalService,
    private environmentInjector: EnvironmentInjector
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadChildComponent();
  }

  loadChildComponent() {
    if (this.childComponentType) {
      const componentRef = createComponent(this.childComponentType, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.modalContent.injector,
      });
      this.modalContent.insert(componentRef.hostView);
    }
  }

  close() {
    this.modalService.close();
  }
}
