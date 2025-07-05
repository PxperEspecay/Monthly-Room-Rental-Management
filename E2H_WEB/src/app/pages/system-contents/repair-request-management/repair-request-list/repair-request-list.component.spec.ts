import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairRequestListComponent } from './repair-request-list.component';

describe('RepairRequestListComponent', () => {
  let component: RepairRequestListComponent;
  let fixture: ComponentFixture<RepairRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepairRequestListComponent]
    });
    fixture = TestBed.createComponent(RepairRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
