import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenterDetailsComponent } from './renter-details.component';

describe('UserDetailsComponent', () => {
  let component: RenterDetailsComponent;
  let fixture: ComponentFixture<RenterDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenterDetailsComponent]
    });
    fixture = TestBed.createComponent(RenterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
