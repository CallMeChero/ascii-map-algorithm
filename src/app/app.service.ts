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
  matrix: any[][] = new Array();
  nextStepDirection: string;
  latestPosition: Coordinates;
  letters: string = "";
  visitedCoordinates: Coordinates[] = [];
  /* #endregion */


  /* #region  Service methods */

  /*
    check if form data is file or textarea
    in case of form file read its content as string
  */
  submitASCIIMap(formData: MapRequest): Observable<string> {
    this.nextStepDirection = "/";
    this.letters = "";
    this.visitedCoordinates = [];

    if (formData.file) {
      //input file
      if (formData.file && formData.file.type !== "text/plain") return throwError("File type has to be .txt ~ text.plain");
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

  /*
    form [][]
    get start coordinates, if its observable then its error
    loop until next step direction is "end" -> x
    return observable of letters
  */
  parseAlgorithm(algorithm: string): Observable<string> {
    this.formTwoDimensionalArray(algorithm);
    const start = this.getStartCoordinates();
    if (isObservable(start)) return start;
    this.latestPosition = start;
    let i = 0;
    while (i < algorithm.length && this.nextStepDirection !== "end") {
      this.letters += this.getFurtherDirAndChar(this.latestPosition.x, this.latestPosition.y);
      i++;
    }
    return from([this.letters]);
  }

  /*
    split string by line breakes
    find out how many rows has algorithm
    make [][]
  */
  formTwoDimensionalArray(algorithm: string): void {
    const arrayOfLines = algorithm.split(/\r\n|\r|\n/);
    const linesInAlgorithm = arrayOfLines.length;

    for (let x = 0; x < linesInAlgorithm; x++) {
      this.matrix[x] = new Array(arrayOfLines[x].length);
      for (let y = 0; y < arrayOfLines[x].length; y++) {
        this.matrix[x][y] = arrayOfLines[x][y];
      }
    }
  }

  /*
   find out where is start & end
   in case of error throw it
  */
  getStartCoordinates(): Coordinates | Observable<never> {
    let startCoordinates = [];
    let endOccurences = 0;
    this.matrix.forEach((row, x) => {
      const y = row.findIndex(element => element === "@");
      const end = row.findIndex(element => element === "x");
      if (y > -1) {
        startCoordinates = [...startCoordinates, { x, y }];
      }
      if (end > -1) {
        endOccurences++;
      }
    });
    // in case of multiple starts or ends throw error
    if (startCoordinates.length > 1) {
      return throwError("Multiple starts")
    } else if (!startCoordinates.length) {
      return throwError("No start")
    } else if (endOccurences === 0) {
      return throwError("No end");
    } else if (endOccurences > 1) {
      return throwError("Multiple ends");
    }
    this.letters = "@";
    return startCoordinates[0];
  }

  /*
    check if previous direction
    in case of '/' look for all
  */
  getFurtherDirAndChar(x: number, y: number): string {
    let char: string;
    if (this.nextStepDirection === "L") {
      char = <string>this.lookLeft(x, y);
      if (!char) { char = <string>this.lookLeft(x, y - 1) }
      return char;
    } else if (this.nextStepDirection === "R") {
      char = <string>this.lookRight(x, y);
      if (!char) { char = <string>this.lookRight(x, y + 1) }
      return char;
    } else if (this.nextStepDirection === "T") {
      char = <string>this.lookTop(x, y);
      if (!char) { char = <string>this.lookTop(x - 1, y) }
      return char;
    } else if (this.nextStepDirection === "B") {
      char = <string>this.lookBottom(x, y);
      if (!char) { char = <string>this.lookBottom(x + 1, y) }
      return char;
    } else {
      return this.searchAllDirections(x, y);
    }
  }

  searchAllDirections(x, y) {
    const charL = this.lookLeft(x, y);
    const charR = this.lookRight(x, y);
    const charT = this.lookTop(x, y);
    const charB = this.lookBottom(x, y);
    return charL ? <string>charL : charB ? <string>charB : charT ? <string>charT : charR ? <string>charR : "";
  }

  lookBottom(x: number, y: number): string | boolean {
    if (this.matrix[x + 1] && !this.checkIfWasHere({ x: x + 1, y })) {
      if (this.matrix[x + 1][y] === DIRECTIONS.downOrUp) {
        return this.setPositionAndDirection(x + 1, y, "B");
      } else if (this.matrix[x + 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x + 1, y, "/");
      } else if (/^[A-Z]+$/.test(this.matrix[x + 1][y])) {
        return this.setPositionAndDirection(x + 1, y, "B");
      } else if (this.matrix[x + 1][y] === "x") {
        return this.setPositionAndDirection(x + 1, y, "end");
      } else {
        return false;
      }
    }
    if (this.matrix[x + 1] && /^[A-Z]+$/.test(this.matrix[x + 1][y]) && this.checkIfWasHere({ x: x + 1, y })) { this.nextStepDirection = "B"; }
    return false;
  }

  lookTop(x: number, y: number): string | boolean {
    if (this.matrix[x - 1] && !this.checkIfWasHere({ x: x - 1, y })) {
      if (this.matrix[x - 1][y] === DIRECTIONS.downOrUp) {
        return this.setPositionAndDirection(x - 1, y, "T");
      } else if (this.matrix[x - 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x - 1, y, "/");
      } else if (this.matrix[x - 1][y] === "x") {
        return this.setPositionAndDirection(x - 1, y, "end");
      } else if (/^[A-Z]+$/.test(this.matrix[x - 1][y])) {
        return this.setPositionAndDirection(x - 1, y, "T");
      } else {
        return false;
      }
    }
    if (this.matrix[x - 1] && /^[A-Z]+$/.test(this.matrix[x - 1][y]) && this.checkIfWasHere({ x: x - 1, y })) { this.nextStepDirection = "T"; }
    return false;
  }

  lookLeft(x: number, y: number): string | boolean {
    if (this.matrix[x][y - 1] && !this.checkIfWasHere({ x, y: y - 1 })) {
      if (this.matrix[x][y - 1] === DIRECTIONS.leftOrRight) {
        return this.setPositionAndDirection(x, y - 1, "L");
      } else if (this.matrix[x][y - 1] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x, y - 1, "/");
      } else if (/^[A-Z]+$/.test(this.matrix[x][y - 1])) {
        return this.setPositionAndDirection(x, y - 1, "L");
      } else if (this.matrix[x][y - 1] === "x") {
        return this.setPositionAndDirection(x, y - 1, "end");
      } else {
        return false;
      }
    }
    if (/^[A-Z]+$/.test(this.matrix[x][y - 1]) && this.checkIfWasHere({ x, y: y - 1 })) { this.nextStepDirection = "L"; }
    return false;
  }

  lookRight(x: number, y: number): string | boolean {
    if (this.matrix[x][y + 1] && !this.checkIfWasHere({ x, y: y + 1 })) {
      if (this.matrix[x][y + 1] === DIRECTIONS.leftOrRight) {
        return this.setPositionAndDirection(x, y + 1, "R");
      } else if (this.matrix[x][y + 1] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x, y + 1, "/");
      } else if (this.matrix[x][y + 1] === "x") {
        return this.setPositionAndDirection(x, y + 1, "end");
      } else if (/^[A-Z]+$/.test(this.matrix[x][y + 1])) {
        return this.setPositionAndDirection(x, y + 1, "R");
      } else {
        return false;
      }
    }
    if (/^[A-Z]+$/.test(this.matrix[x][y + 1]) && this.checkIfWasHere({ x, y: y + 1 })) { this.nextStepDirection = "R"; }
    return false;
  }

  setPositionAndDirection(x: number, y: number, direction: string): string {
    this.nextStepDirection = direction;
    this.latestPosition = { x, y };
    this.visitedCoordinates = [...this.visitedCoordinates, this.latestPosition];
    return this.matrix[x][y];
  }

  checkIfWasHere(currentPosition: Coordinates): boolean {
    if (this.visitedCoordinates.find(item => item.x === currentPosition.x && item.y === currentPosition.y)) {
      return true;
    } else {
      return false;
    }
  }

  /* #endregion */
}
