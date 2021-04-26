import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from './app.service';
import { MapRequest } from './map-request';

describe('AppComponent', () => {

  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let appService: Partial<AppService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [{ provide: AppService, useClass: AppService }],
      imports: [ReactiveFormsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    appService = TestBed.inject(AppService);
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ascii-map-algorithm'`, () => {
    expect(app.title).toEqual('ascii-map-algorithm');
  });

  it('should render title in h2 tag', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('ASCII Map Algorthm');
  });

  it('should render title in p tag', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('In order to test assignment you can submit a .txt file or paste code into textarea element');
  });

  it('should update the value in the group', () => {
    app.appForm.patchValue({ textArea: 'Blue' });
    expect(app.appForm.get('textArea').value).toBe('Blue')
  });

  it('should call service method with provided formData', function () {
    const formData: MapRequest = {
      textArea: `@---A---x`,
      file: null
    };
    spyOn(appService, 'submitASCIIMap');
    appService.submitASCIIMap(formData);
    expect(appService.submitASCIIMap).toHaveBeenCalledWith(formData)
  });
});
