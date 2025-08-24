import {
  Component,
  EventEmitter,
  Inject,
  Output,
  PLATFORM_ID,
} from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { isPlatformBrowser } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-gdpr',
  templateUrl: './gdpr.component.html',
  styleUrls: ['./gdpr.component.scss'],
  imports: [SharedModule],
})
export class GdprComponent {
  @Output('acceptGDPR') acceptGDPR: EventEmitter<any> = new EventEmitter();
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  acceptAll() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('_fvrl_ckie_cnst', JSON.stringify(true));
    }
    this.acceptGDPR.emit();
  }
}
