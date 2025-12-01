import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bolsa } from './bolsa.component';

describe('Bolsa', () => {
  let component: Bolsa;
  let fixture: ComponentFixture<Bolsa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bolsa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bolsa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
