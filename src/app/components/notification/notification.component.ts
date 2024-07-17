import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  notification: { message: string } = {
    message: '',
  };

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.commonService.notificationSubject$.subscribe((notification: any) => {
      this.notification = notification;
    });
  }

  clearNotification() {
    this.commonService.updateNotificationSubject({
      message: '',
    });
  }
}
