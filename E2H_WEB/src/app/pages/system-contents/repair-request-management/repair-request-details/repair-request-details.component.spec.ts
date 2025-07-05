import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairRequestDetailsComponent } from './repair-request-details.component';

describe('RepairRequestDetailsComponent', () => {
  let component: RepairRequestDetailsComponent;
  let fixture: ComponentFixture<RepairRequestDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepairRequestDetailsComponent]
    });
    fixture = TestBed.createComponent(RepairRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
