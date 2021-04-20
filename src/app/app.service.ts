import { Injectable } from '@angular/core';
import { Observable, throwError, isObservable, from } from 'rxjs';
import { Coordinates } from './coordinates';
import { DIRECTIONS } from './direction.enum';
import { MapRequest } from './map-request';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  /* #region  Service variables */
  algorithmMatrix: any[][] = new Array();
  nextStepDirection: string = "/";
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

    // todo
    let it = 0;
    while (it < 3) {
      console.log(this.getCharacter(currentPosition.y, currentPosition.x))
      this.letters += this.getCharacter(currentPosition.y, currentPosition.x);
      it++;
    }
    console.log(this.letters)
    return from(["ok"]);
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
        startCoordinates = [...startCoordinates, { y, x }];
      }
    });
    // in case of multiple starts throw error
    if (startCoordinates.length > 1) {
      return throwError("Multiple starts")
    } else if (!startCoordinates.length) {
      return throwError("No start")
    }
    this.letters = "@"
    return startCoordinates[0];
  }

  /*
    check if its letter or character
    if letter, find direction and next one
    if character(other than @) find next one
  */
  getCharacter(x: number, y: number) {
    return this.getFurtherDirAndChar(x, y);
  }

  getFurtherDirAndChar(x: number, y: number) {
    let char: string;
    if (this.nextStepDirection === "L") {
      char = <string>this.lookLeft(x, y);
      console.log("usao lijevo")
    } else if (this.nextStepDirection === "R") {
      char = <string>this.lookRight(x, y);
      console.log("usao desno")
    } else if (this.nextStepDirection === "T") {
      char = <string>this.lookTop(x, y);
    } else if (this.nextStepDirection === "B") {
      char = <string>this.lookBottom(x, y);
    } else {
      console.log("nisi smio tu uc")
      char = this.lookLeft(x, y)
        ? <string>this.lookLeft(x, y) : this.lookRight(x, y)
          ? <string>this.lookRight(x, y) : this.lookTop(x, y)
            ? <string>this.lookTop(x, y) : this.lookBottom(x, y)
              ? <string>this.lookBottom(x, y) : "";
    }
    return char;
  }


  lookTop(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x + 1] && this.algorithmMatrix[x + 1][y] === DIRECTIONS.downOrUp) {
      this.nextStepDirection = "T";
      return this.algorithmMatrix[x][y + 1];
    }
    return false;
  }

  lookBottom(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x - 1] && this.algorithmMatrix[x - 1][y] === DIRECTIONS.downOrUp) {
      this.nextStepDirection = "B";
      return this.algorithmMatrix[x - 1][y];
    }
    return false;
  }

  lookLeft(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x][y - 1] && this.algorithmMatrix[x][y - 1] === DIRECTIONS.leftOrRight) {
      this.nextStepDirection = "L";
      return this.algorithmMatrix[x][y - 1];
    }
    return false;
  }

  lookRight(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x][y + 1] && this.algorithmMatrix[x][y + 1] === DIRECTIONS.leftOrRight) {
      this.nextStepDirection = "R";
      return this.algorithmMatrix[x][y + 1];
    }
  }

  /* #endregion */
}
