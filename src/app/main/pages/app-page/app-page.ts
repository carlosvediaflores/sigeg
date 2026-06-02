import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-app-page',
  imports: [],
  templateUrl: './app-page.html',
  styleUrl: './app-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPage {}
