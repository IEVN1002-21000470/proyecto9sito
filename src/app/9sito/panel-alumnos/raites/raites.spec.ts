import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Raites } from './raites.component';

describe('Raites', () => {
  let component: Raites;
  let fixture: ComponentFixture<Raites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Raites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Raites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
