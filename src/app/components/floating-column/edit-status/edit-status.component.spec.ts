import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditStatusComponent } from '../edit-status/edit-status.component';


xdescribe('EditStatusComponent', () => {
  let component: EditStatusComponent;
  let fixture: ComponentFixture<EditStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
