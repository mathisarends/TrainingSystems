import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modal.service';
import { InfoComponent } from '../../../shared/components/info/info.component';
import { SkeletonCardComponent } from '../../../shared/components/loader/skeleton-card/skeleton-card.component';
import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IconName } from '../../../shared/icon/icon-name';
import { HeaderService } from '../../header/header.service';
import { SetHeadlineInfo } from '../../header/set-headline-info';
import { TrainingPlanEditView } from '../model/training-plan-edit-view';
import { TrainingPlanCardComponent } from '../training-plan-card/training-plan-card.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { EditTrainingPlanComponent } from './edit-training/edit-training.component';
import { TrainingSchedulingComponent } from './training-scheduling/training-scheduling.component';

/**
 * Component to manage and display training plans.
 */
@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [CommonModule, TrainingPlanCardComponent, SkeletonCardComponent, SpinnerComponent, InfoComponent],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
  providers: [TrainingPlanService],
})
export class TrainingPlansComponent implements OnInit, SetHeadlineInfo {
  /**
   * Holds the filtered training plans to display.
   */
  filteredTrainingPlans: WritableSignal<TrainingPlanCardView[]> = signal([]);

  /**
   * Signal indicating whether the data is still loading.
   */
  isLoading = signal(true);

  trainingPlanEntryCount = signal(0);

  /**
   * Signal representing the number of skeleton cards to display while loading.
   */
  skeletonCardCount = computed(() => Array.from({ length: this.trainingPlanEntryCount() }, (_, i) => i));

  constructor(
    protected trainingPlanService: TrainingPlanService,
    private modalService: ModalService,
    private headerService: HeaderService,
    private destroyRef: DestroyRef,
  ) {}

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Loads training plans, subscribes to search input and modal events, and listens for "Ctrl + F".
   */
  ngOnInit(): void {
    this.trainingPlanEntryCount.set(this.trainingPlanService.getTrainingPlansEntryCount());

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
      buttons: [{ icon: IconName.PLUS, callback: () => this.openCreateNewPlanModal() }],
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
  protected openCreateNewPlanModal(): void {
    this.trainingPlanService.getNextAvailableStartDateForNewTrainingPlan().subscribe((startDate) => {
      const modalTabs: ModalTab[] = [
        {
          label: 'Allgemein',
          component: EditTrainingPlanComponent,
        },
        {
          label: 'Kalendar',
          component: TrainingSchedulingComponent,
        },
      ];

      const trainingPlanEditView = TrainingPlanEditView.fromCreateDto(startDate);

      const providerMap = new Map().set(TrainingPlanEditView, trainingPlanEditView);

      const modalOptions = new ModalOptionsBuilder()
        .setTabs(modalTabs)
        .setProviderMap(providerMap)
        .setButtonText('Erstellen')
        .setOnSubmitCallback(async () => this.createNewPlan(trainingPlanEditView))
        .setOnValidateCallback(() => {
          if (trainingPlanEditView.isValid()) {
            return true;
          }

          return 'Bitte füllen Sie alle verpflichtenden Felder aus';
        })
        .build();

      this.modalService.openModalTabs(modalOptions);
    });
  }

  private async createNewPlan(trainnigPlanEditView: TrainingPlanEditView): Promise<void> {
    await firstValueFrom(this.trainingPlanService.createTrainingPlan(trainnigPlanEditView));
  }
}
