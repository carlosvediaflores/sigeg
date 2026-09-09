import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-slidergamb',
  imports: [RouterLink],
  templateUrl: './slidergamb.html',
  styleUrl: './slidergamb.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slidergamb {}
