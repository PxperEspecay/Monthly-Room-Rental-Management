import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveReportedDetailsComponent } from './receive-reported-details.component';

describe('ReceiveReportedDetailsComponent', () => {
  let component: ReceiveReportedDetailsComponent;
  let fixture: ComponentFixture<ReceiveReportedDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiveReportedDetailsComponent]
    });
    fixture = TestBed.createComponent(ReceiveReportedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
