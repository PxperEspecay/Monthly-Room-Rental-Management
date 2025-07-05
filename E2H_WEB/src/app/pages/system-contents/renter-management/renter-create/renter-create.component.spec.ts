import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenterCreateComponent } from './renter-create.component';

describe('RenterCreateComponent', () => {
  let component: RenterCreateComponent;
  let fixture: ComponentFixture<RenterCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenterCreateComponent]
    });
    fixture = TestBed.createComponent(RenterCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
