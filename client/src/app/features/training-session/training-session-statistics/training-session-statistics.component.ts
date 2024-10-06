import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../header/header.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'selector-name',
  templateUrl: 'training-session-statistics.component.html',
  styleUrls: ['./training-session-statistics.component.scss'],
})
export class TrainingSesssionStatisticsComponent implements OnInit {
  constructor() {}

  ngOnInit(private headerService: HeaderService) {}
}
