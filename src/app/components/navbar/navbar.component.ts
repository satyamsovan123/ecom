import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  constructor(private commonService: CommonService) {}

  ngOnInit() {
    this.commonService.authenticationSubject$.subscribe(
      (authenticationState) => {
        this.isAuthenticated = authenticationState;
      }
    );
  }

  handleSignout() {
    this.commonService.handleSignout();
  }
}
