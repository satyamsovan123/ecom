import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {
  constructor(private commonService: CommonService) {}
  loaderState: boolean = true;
  ngOnInit() {
    this.commonService.loaderSubject$.subscribe((loaderState: boolean) => {
      this.loaderState = loaderState;
    });
  }
}
