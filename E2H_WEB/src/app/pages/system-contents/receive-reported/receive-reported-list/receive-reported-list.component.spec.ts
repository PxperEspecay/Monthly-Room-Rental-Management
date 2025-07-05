import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveReportedListComponent } from './receive-reported-list.component';

describe('ReceiveReportedListComponent', () => {
  let component: ReceiveReportedListComponent;
  let fixture: ComponentFixture<ReceiveReportedListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiveReportedListComponent]
    });
    fixture = TestBed.createComponent(ReceiveReportedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
