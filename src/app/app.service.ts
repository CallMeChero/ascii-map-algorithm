import { Injectable } from '@angular/core';
import { Observable, throwError, isObservable } from 'rxjs';
import { Coordinates } from './coordinates';
import { DIRECTIONS } from './direction.enum';
import { MapRequest } from './map-request';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  /* #region  Service variables */
  algorithmMatrix: any[][];
  firstStepActive: boolean = true;
  nextStepDirection: string = "";
  letters: string = "";
  /* #endregion */

  /* #region  Service methods */
  // Submit map method
  submitASCIIMap(formData: MapRequest): Observable<string> {
    if (formData.file && formData.file.type !== "text/plain") return throwError("File type has to be .txt ~ text.plain");
    return this.solveMapAlgorithm(formData);
  }

  solveMapAlgorithm(formData: MapRequest): Observable<string> {
    if (formData.file) {
      //input file
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        return this.parseAlgorithm(content.toString());
      };
      reader.readAsText(formData.file);
    } else {
      // textarea
      return this.parseAlgorithm(formData.textArea);
    }
  }


  parseAlgorithm(algorithm: string): Observable<string> {
    this.formTwoDimensionalArray(algorithm);
    const start = this.getStartCoordinates();
    //if multiple or no start throw observable error msg
    if (isObservable(start)) return start;
    let currentPosition = start;
    while (true) {
      this.getNextCharacter(currentPosition.x, currentPosition.y)
    }
  }

  /*
    split string by line breakes
    find out how many rows has algorithm
    make [][]
  */
  formTwoDimensionalArray(algorithm: string): void {
    // split
    const arrayOfLines = algorithm.split(/\r\n|\r|\n/);
    // rows
    const linesInAlgorithm = arrayOfLines.length;
    // first push for initialization of []
    this.algorithmMatrix = new Array(arrayOfLines);
    for (let x = 0; x < linesInAlgorithm; x++) {
      this.algorithmMatrix[x] = new Array(arrayOfLines[x].length);
      for (let y = 0; y < arrayOfLines[x].length; y++) {
        this.algorithmMatrix[x][y] = arrayOfLines[x][y];
      }
    }
  }

  /*
   find out where is start
   in case of error throw it
  */
  getStartCoordinates(): Coordinates | Observable<never> {
    // find out where is algorithm starting
    let startCoordinates = [];
    this.algorithmMatrix.forEach((row, y) => {
      const x = row.findIndex(element => element === "@");
      if (x > -1) {
        startCoordinates = [...startCoordinates, { x, y }];
      }
    });
    // in case of multiple starts throw error
    if (startCoordinates.length > 1) {
      return throwError("Multiple starts")
    } else if (!startCoordinates.length) {
      return throwError("No start")
    }
    return startCoordinates[0];
  }

  /*
  check if its letter or character
  if letter, find direction and next one
  if character(other than @) find next one
  */
  getNextCharacter(x: number, y: number) {
    if (this.firstStepActive) {
      this.lookLeftOrRight(x, y);
    }
  }

  lookTopOrBottom(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x][y + 1] === DIRECTIONS.downOrUp) {
      this.nextStepDirection = "T";
      return this.algorithmMatrix[x][y + 1];
    } else if (this.algorithmMatrix[x][y - 1] === DIRECTIONS.downOrUp) {
      this.nextStepDirection = "B";
      return this.algorithmMatrix[x][y - 1];
    } else {
      return false;
    }
  }

  lookLeftOrRight(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x + 1][y] === DIRECTIONS.leftOrRight) {
      this.nextStepDirection = "R";
      return this.algorithmMatrix[x + 1][y];
    } else if (this.algorithmMatrix[x - 1][y] === DIRECTIONS.leftOrRight) {
      this.nextStepDirection = "L";
      return this.algorithmMatrix[x - 1][y];
    } else {
      return false;
    }
  }

  /* #endregion */
}
