import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsCreateComponent } from './bills-create.component';

describe('BillsCreateComponent', () => {
  let component: BillsCreateComponent;
  let fixture: ComponentFixture<BillsCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillsCreateComponent]
    });
    fixture = TestBed.createComponent(BillsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
