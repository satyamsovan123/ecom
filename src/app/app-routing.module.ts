import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OrderComponent } from './components/order/order.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { ContentComponent } from './components/content/content.component';
import { authenticationGuard } from './services/authentication.guard';
import { HelpComponent } from './components/help/help.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'order',
    component: OrderComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authenticationGuard],
  },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'content',
    component: ContentComponent,
    canActivate: [authenticationGuard],
  },
  { path: 'help', component: HelpComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
