import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from '../../../core/services';

@Component({
  standalone: true,
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  loaderProgress$ = new BehaviorSubject<number>(0);

  constructor(private _LoaderService: LoaderService) {
    this.loaderProgress$ = this._LoaderService.loadingProgress$;
  }

  ngOnInit(): void {}
}
