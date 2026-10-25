import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelChatComponent } from './admin-panel-chat.component';

describe('AdminPanelChatComponent', () => {
  let component: AdminPanelChatComponent;
  let fixture: ComponentFixture<AdminPanelChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminPanelChatComponent]
    });
    fixture = TestBed.createComponent(AdminPanelChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
