import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitiesListComponent } from './communities-list.component';

describe('CommunitiesListComponent', () => {
  let component: CommunitiesListComponent;
  let fixture: ComponentFixture<CommunitiesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunitiesListComponent]
    });
    fixture = TestBed.createComponent(CommunitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
