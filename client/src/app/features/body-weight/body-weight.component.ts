import { Component, OnInit } from '@angular/core';
import { BodyWeightEntryDto } from './dto/body-weight-entry-dto';
import { Observable } from 'rxjs';
import { BodyWeightService } from './body-weight.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-body-weight',
  imports: [CommonModule, SpinnerComponent],
  standalone: true,
  templateUrl: './body-weight.component.html',
  styleUrls: ['./body-weight.component.scss'],
})
export class BodyWeightComponent implements OnInit {
  bodyWeights$!: Observable<BodyWeightEntryDto[]>;

  constructor(private readonly bodyWeightService: BodyWeightService) {}

  ngOnInit(): void {
    this.bodyWeights$ = this.bodyWeightService.getBodyWeights();
  }
}
