import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateHostelComponent } from './create-hostel/create-hostel.component';
import { HostelPageComponent } from './hostel-page/hostel-page.component';
import { UsersComponent } from './users/users.component';
import { TransactionComponent } from './transaction/transaction.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ContactusComponent } from './contactus/contactus.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AdminPanelChatComponent } from './admin-panel-chat/admin-panel-chat.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';

const routes: Routes = [
  {path:'', component:LoginComponent},
  { path: 'login', component: LoginComponent },
  { path: 'subscription-plans', component: SubscriptionPlansComponent },
  {path:'register', component:RegisterComponent},
  {path:'home', component:HomeComponent},
  {path:'profile', component:ProfileComponent},
  {path:'hostel-page/:id', component:HostelPageComponent},
  {path:'user', component:UsersComponent},
  { path:'add-user', component: AddUserComponent },
  {path:'transaction', component:TransactionComponent},
  {path:'create-hostel', component:CreateHostelComponent},
  {path: 'chat/:ownerId/:hostelId/:userId', component: ChatComponent },
  {path:'notification', component:NotificationComponent},
  {path:'notification-page', component:NotificationPageComponent},
  {path:'aboutus', component:AboutusComponent},
  {path:'contact', component:ContactusComponent},
  {path:'terms&conditions',component:TermsConditionsComponent},
  {path:'privacy&policy', component:PrivacyPolicyComponent},
  {path: 'admin-support',component: AdminPanelChatComponent},
  {path: 'subscription',component: SubscriptionPlansComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
