import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonService } from './services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ecom';
  disableBackground: boolean = false;
  daysRemaining: number = 0;

  constructor(
    private commonService: CommonService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.commonService.checkSavedCredentials();
    this.commonService.loaderSubject$.subscribe((loaderState) => {
      this.disableBackground = loaderState;
    });

    this.commonService.daysRemainingSubject$.subscribe((daysRemaining) => {
      this.daysRemaining = daysRemaining;
    });
  }
}
