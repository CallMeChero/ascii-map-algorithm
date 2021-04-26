import { AfterViewInit, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, from, of, Subject } from 'rxjs';
import { catchError, exhaustMap, map, take, tap } from 'rxjs/operators';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  /* #region  Component variables */
  title = 'ascii-map-algorithm';
  appForm!: FormGroup;
  submit$: Subject<boolean> = new Subject();
  /* #endregion */

  /* #region  Constructor */
  constructor(
    private _formBuilder: FormBuilder,
    private _appService: AppService
  ) {
    this.appForm = this._formBuilder.group({
      textArea: '',
      file: null
    })
  }
  /* #endregion */

  /* #region Component methods */
  ngAfterViewInit() {
    this.submit$.pipe(
      exhaustMap(() => this._appService.submitASCIIMap(this.appForm.value).pipe(
        take(1),
        catchError(err => {
          console.error(err);
          alert(err)
          return EMPTY;
        })
      ))
    ).subscribe(data => console.log(data))
  }

  // On change event for file upload
  handleFileInput(files: FileList) {
    this.appForm.patchValue({
      file: files.item(0)
    });
  }

  onSubmit() {
    if (!this.file.value && !this.textArea.value) {
      alert("In order to test assignment you can submit a .txt file or paste code into textarea element");
      return;
    }
    this.submit$.next(true);
  }
  /* #endregion */

  /* #region  Abstreact controls */
  get file(): AbstractControl {
    return this.appForm.get('file');
  }

  get textArea(): AbstractControl {
    return this.appForm.get('textArea');
  }
  /* #endregion */
}
