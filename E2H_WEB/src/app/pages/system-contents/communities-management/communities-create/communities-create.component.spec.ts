import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitiesCreateComponent } from './communities-create.component';

describe('CommunitiesCreateComponent', () => {
  let component: CommunitiesCreateComponent;
  let fixture: ComponentFixture<CommunitiesCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunitiesCreateComponent]
    });
    fixture = TestBed.createComponent(CommunitiesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
