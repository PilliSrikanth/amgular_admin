import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { CreateHostelComponent } from './create-hostel/create-hostel.component';
import { HostelPageComponent } from './hostel-page/hostel-page.component';
import { UsersComponent } from './users/users.component';
import { TransactionComponent } from './transaction/transaction.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ContactusComponent } from './contactus/contactus.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AdminPanelChatComponent } from './admin-panel-chat/admin-panel-chat.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    CreateHostelComponent,
    HostelPageComponent,
    UsersComponent,
    TransactionComponent,
    AddUserComponent,
    ChatComponent,
    ProfileComponent,
    NotificationComponent,
    NotificationPageComponent,
    AboutusComponent,
    ContactusComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    AdminPanelChatComponent,
    SubscriptionPlansComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,  
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
