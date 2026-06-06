import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-app-page',
  imports: [RouterLink],
  templateUrl: './app-page.html',
  styleUrl: './app-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPage {}
