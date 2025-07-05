import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemContentsComponent } from './system-contents.component';

describe('SystemContentsComponent', () => {
  let component: SystemContentsComponent;
  let fixture: ComponentFixture<SystemContentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemContentsComponent]
    });
    fixture = TestBed.createComponent(SystemContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
