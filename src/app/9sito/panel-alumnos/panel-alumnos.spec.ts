import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAlumnos } from './panel-alumnos.component';

describe('PanelAlumnos', () => {
  let component: PanelAlumnos;
  let fixture: ComponentFixture<PanelAlumnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAlumnos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAlumnos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
