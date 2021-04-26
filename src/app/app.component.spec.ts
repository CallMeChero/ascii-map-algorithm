import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from './app.service';

describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [AppService],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ascii-map-algorithm'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ascii-map-algorithm');
  });

  it('should render title in h2 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('ASCII Map Algorthm');
  });

  it('should render title in p tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    console.log(fixture)
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('In order to test assignment you can submit a .txt file or paste code into textarea element');
  });

  it('should update the value in the group', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.appForm.patchValue({textArea: 'Blue'});
    expect(app.appForm.get('textArea').value).toBe('Blue')
  });

  it('should upload the file 1', () => {
    spyOn(AppService,'submitASCIIMap').and.callThrough();
    component.onSubmit();
    expect(AppService.submitASCIIMap).toHaveBeenCalled();
});

it('should upload the file 2', () => {
    spyOn(AppService,'submitASCIIMap').and.callThrough();
    component.onSubmit();
    expect(AppService.submitASCIIMap).toHaveBeenCalledTimes(0);
});
});
