import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateAuthComponent } from './template-auth.component';

describe('TemplateAuthComponent', () => {
  let component: TemplateAuthComponent;
  let fixture: ComponentFixture<TemplateAuthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateAuthComponent]
    });
    fixture = TestBed.createComponent(TemplateAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
