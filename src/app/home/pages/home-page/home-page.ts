import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSlider } from '../../components/heroSlider/heroSlider';

@Component({
  selector: 'app-home-page',
  imports: [HeroSlider],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
