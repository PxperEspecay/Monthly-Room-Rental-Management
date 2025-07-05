import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingCreateBuildingComponent } from './building-create-building.component';

describe('BuildingCreateBuildingComponent', () => {
  let component: BuildingCreateBuildingComponent;
  let fixture: ComponentFixture<BuildingCreateBuildingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuildingCreateBuildingComponent]
    });
    fixture = TestBed.createComponent(BuildingCreateBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
