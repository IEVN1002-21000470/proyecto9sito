import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocentesComponent } from './panel-docentes.component';

describe('PanelDocentes', () => {
  let component: PanelDocentesComponent;
  let fixture: ComponentFixture<PanelDocentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelDocentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelDocentesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
