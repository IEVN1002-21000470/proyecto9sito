import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mercado } from './mercado.component';

describe('Mercado', () => {
  let component: Mercado;
  let fixture: ComponentFixture<Mercado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mercado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mercado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
