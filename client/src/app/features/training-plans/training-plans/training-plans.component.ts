import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modalService';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { CircularIconButtonComponent } from '../../../shared/components/circular-icon-button/circular-icon-button.component';
import { IconBackgroundColor } from '../../../shared/components/icon-list-item/icon-background-color';
import { IconListeItemComponent } from '../../../shared/components/icon-list-item/icon-list-item.component';
import { SkeletonCardComponent } from '../../../shared/components/loader/skeleton-card/skeleton-card.component';
import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { TrainingSessionService } from '../../training-session/training-session-service';
import { TrainingPlanEditView } from '../model/training-plan-edit-view';
import { TrainingPlanCardComponent } from '../training-plan-card/training-plan-card.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { CreateSessionComponent } from './create-session/create-session.component';
import { CreateTrainingComponent } from './create-training/create-training.component';
import { TrainingPlanTypeSelectionComponent } from './training-plan-type-selection/training-plan-type-selection.component';
import { TrainingSchedulingComponent } from './training-scheduling/training-scheduling.component';

/**
 * Component to manage and display training plans.
 */
@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [
    AlertComponent,
    CommonModule,
    TrainingPlanCardComponent,
    SkeletonCardComponent,
    CircularIconButtonComponent,
    SearchBarComponent,
    DragDropModule,
    SpinnerComponent,
    IconListeItemComponent,
  ],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
  providers: [TrainingSessionService],
})
export class TrainingPlansComponent implements OnInit, SetHeadlineInfo {
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;

  protected readonly IconName = IconName;
  protected readonly IconBackgroundColor = IconBackgroundColor;

  /**
   * Holds the filtered training plans to display.
   */
  filteredTrainingPlans: WritableSignal<TrainingPlanCardView[]> = signal([]);

  /**
   * Signal indicating whether the data is still loading.
   */
  isLoading = signal(true);

  constructor(
    protected trainingPlanService: TrainingPlanService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans, subscribes to search input and modal events, and listens for "Ctrl + F".
   */
  ngOnInit(): void {
    this.setHeadlineInfo();

    this.loadTrainingPlans();

    this.trainingPlanService.trainingPlansChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadTrainingPlans();
    });
  }

  /**
   * Sets up the header information, including buttons and options.
   * The header contains controls for creating new plans and toggling the search bar.
   */
  setHeadlineInfo(): void {
    this.headerService.setHeadlineInfo({
      title: 'Training',
      buttons: [{ icon: IconName.PLUS, callback: this.createNewPlan.bind(this) }],
    });
  }

  /**
   * Loads training plans from the server.
   */
  protected loadTrainingPlans(): void {
    this.trainingPlanService.loadAndCacheTrainingPlans().subscribe((combinedResults) => {
      this.filteredTrainingPlans.set(combinedResults);
      this.isLoading.set(false);
    });
  }

  /**
   * Opens the modal to create a new training plan.
   */
  protected createNewPlan(): void {
    const modalTabs: ModalTab[] = [
      {
        label: 'Plan',
        component: TrainingPlanTypeSelectionComponent,
      },

      {
        label: 'Allgemein',
        component: CreateTrainingComponent,
      },
      {
        label: 'Kalendar',
        component: TrainingSchedulingComponent,
      },
    ];

    const trainingPlanEditView = TrainingPlanEditView.fromDto();
    const providerMap = new Map().set(TrainingPlanEditView, trainingPlanEditView);

    const modalOptions = new ModalOptionsBuilder()
      .setTabs(modalTabs)
      .setProviderMap(providerMap)
      .setButtonText('Erstellen')
      .setOnSubmitCallback(() => console.log(''))
      .build();

    this.modalService.openModalTabs(modalOptions);
  }

  protected createNewSession(): void {
    const modalOptions = new ModalOptionsBuilder()
      .setComponent(CreateSessionComponent)
      .setTitle('Trainingsession erstellen')
      .build();

    this.modalService.open(modalOptions);
  }

  protected openTrainingTypeExplanation(): void {
    this.modalService.openBasicInfoModal({
      title: 'Plan vs Session',
      buttonText: 'Verstanden',
      infoText:
        'Ein Trainingsplan ist ideal, wenn du langfristig deine Fitnessziele erreichen möchtest. Er basiert auf dem Prinzip der Blockperiodisierung und verteilt dein Training über mehrere Wochen mit zunehmendem Volumen und steigender Intensität. So kannst du systematisch Fortschritte erzielen und die Belastung kontinuierlich steigern. \n\nEine Session hingegen ist eine einzelne, wiederholbare Trainingseinheit, die unabhängig oder als Teil eines Plans genutzt werden kann. Sie eignet sich perfekt für gezielte Einheiten, die du nach Belieben in dein Training integrieren kannst. Ob Plan oder Session – die Wahl hängt ganz von deinem Trainingsstil und deinen Zielen ab!',
    });
  }
}
