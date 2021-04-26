import { Injectable } from '@angular/core';
import { Observable, throwError, isObservable, from } from 'rxjs';
import { Coordinates } from './coordinates';
import { DIRECTIONS } from './direction.enum';
import { MapRequest } from './map-request';
import { MapResponse } from './map.response';

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
  submitASCIIMap(formData: MapRequest): Observable<MapResponse> {
    this.setToInitial();

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
      if (!formData.textArea) return throwError("Textarea is empty")
      return this.parseAlgorithm(formData.textArea);
    }
  }

  setToInitial(): void {
    this.nextStepDirection = "/";
    this.letters = "";
    this.visitedCoordinates = [];
    this.latestPosition = null;
    this.matrix = new Array();
  }

  /*
    form [][]
    get start coordinates, if its observable then its error
    loop until next step direction is "E" -> x
    return observable of letters
  */
  parseAlgorithm(algorithm: string): Observable<MapResponse> {
    this.formTwoDimensionalArray(algorithm);
    const start = this.getStartCoordinates();
    if (isObservable(start)) return start;
    this.latestPosition = start;
    while (this.nextStepDirection !== "E") {
      this.letters += this.getFurtherDirAndChar(this.latestPosition.x, this.latestPosition.y);
    }
    return from([{ letters: this.letters.replace(/[^A-Z ]/g, ""), pathAsCharacters: this.letters }]);
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
    let startCoordinates: Coordinates[] = [];
    let endOccurences: number[] = [];
    this.matrix.forEach((row, x) => {
      const starts: number[] = this.countOccurences(row, "@");
      const ends: number[] = this.countOccurences(row, "x");
      if (starts.length === 1) {
        startCoordinates = [...startCoordinates, { x: x, y: starts[0] }];
      }
      if (ends.length === 1) {
        endOccurences = [...endOccurences, ends[0]];
      }
    });
    if (startCoordinates.length > 1 || endOccurences.length > 1 || !startCoordinates.length || !endOccurences.length) {
      return throwError("Error")
    }
    this.letters = "@";
    return startCoordinates[0];
  }

  countOccurences(array: string[], element: string): number[] {
    let occurences: number[] = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i] === element) {
        occurences.push(i);
      }
    }
    return occurences;
  }

  /*
    check if previous direction
    in case of '/' look for all
  */
  getFurtherDirAndChar(x: number, y: number): string {
    if (this.nextStepDirection === "L") {
      return <string>this.lookLeft(x, y);
    } else if (this.nextStepDirection === "R") {
      return <string>this.lookRight(x, y);
    } else if (this.nextStepDirection === "T") {
      return <string>this.lookTop(x, y);
    } else if (this.nextStepDirection === "B") {
      return <string>this.lookBottom(x, y);
    } else {
      return this.searchAllDirections(x, y);
    }
  }

  lookBottom(x: number, y: number, counter: number = 0): string | boolean {
    if (this.matrix[x + 1] && !this.checkIfWasHere({ x: x + 1, y })) {
      if (this.matrix[x + 1][y] === DIRECTIONS.downOrUp || /^[A-Z]+$/.test(this.matrix[x + 1][y])) {
        return this.setPositionAndDirection(x + 1, y, "B");
      } else if (this.matrix[x + 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x + 1, y, "/");
      } else if (this.matrix[x + 1][y] === "x") {
        return this.setPositionAndDirection(x + 1, y, "E");
      }
    }
    if (this.nextStepDirection === "B") {
      if (counter === 0) {
        return this.lookBottom(x + 1, y, 1);
      } else {
        this.nextStepDirection = "/";
        return this.searchAllDirections(x - 1, y);
      }

    }
    return false;
  }

  lookTop(x: number, y: number, counter: number = 0): string | boolean {
    if (this.matrix[x - 1] && !this.checkIfWasHere({ x: x - 1, y })) {
      if (this.matrix[x - 1][y] === DIRECTIONS.downOrUp || /^[A-Z]+$/.test(this.matrix[x - 1][y])) {
        return this.setPositionAndDirection(x - 1, y, "T");
      } else if (this.matrix[x - 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x - 1, y, "/");
      } else if (this.matrix[x - 1][y] === "x") {
        return this.setPositionAndDirection(x - 1, y, "E");
      }
    }
    if (this.nextStepDirection === "T") {
      if (counter === 0) {
        return this.lookTop(x - 1, y, 1);
      } else {
        this.nextStepDirection = "/";
        return this.searchAllDirections(x + 1, y);
      }
    }
    return false;
  }

  lookLeft(x: number, y: number, counter: number = 0): string | boolean {
    if (this.matrix[x][y - 1] && !this.checkIfWasHere({ x, y: y - 1 })) {
      if (this.matrix[x][y - 1] === DIRECTIONS.leftOrRight) {
        return this.setPositionAndDirection(x, y - 1, "L");
      } else if (this.matrix[x][y - 1] === DIRECTIONS.corner || /^[A-Z]+$/.test(this.matrix[x][y - 1])) {
        return this.setPositionAndDirection(x, y - 1, "/");
      } else if (this.matrix[x][y - 1] === "x") {
        return this.setPositionAndDirection(x, y - 1, "E");
      }
    }
    if (this.nextStepDirection === "L") {
      if (counter === 0) {
        return this.lookLeft(x, y - 1, 1);
      } else {
        this.nextStepDirection = "/";
        return this.searchAllDirections(x, y + 1);
      }
    }
    return false;
  }

  lookRight(x: number, y: number, counter: number = 0): string | boolean {
    if (this.matrix[x][y + 1] && !this.checkIfWasHere({ x, y: y + 1 })) {
      if (this.matrix[x][y + 1] === DIRECTIONS.leftOrRight || /^[A-Z]+$/.test(this.matrix[x][y + 1])) {
        return this.setPositionAndDirection(x, y + 1, "R");
      } else if (this.matrix[x][y + 1] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x, y + 1, "/");
      } else if (this.matrix[x][y + 1] === "x") {
        return this.setPositionAndDirection(x, y + 1, "E");
      }
    }
    if (this.nextStepDirection === "R") {
      if (counter === 0) {
        return this.lookRight(x, y + 1, 1);
      } else {
        this.nextStepDirection = "/";
        return this.searchAllDirections(x, y - 1);
      }
    }
    return false;
  }

  searchAllDirections(x, y): string {
    let charL = this.lookLeft(x, y);
    let charR = this.lookRight(x, y);
    let charT = this.lookTop(x, y);
    let charB = this.lookBottom(x, y);

    if (!charL && !charR && !charT && !charB) {
      charL = this.lookLeft(x, y - 1);
      charR = this.lookRight(x, y + 1);
      charT = this.lookTop(x - 1, y);
      charB = this.lookBottom(x + 1, y);
    }
    return charL ? <string>charL : charB ? <string>charB : charT ? <string>charT : charR ? <string>charR : "";
  }

  /*
    save direction for next step
    save latest position
    concat latest with all
  */
  setPositionAndDirection(x: number, y: number, direction: string): string {
    this.nextStepDirection = direction;
    this.latestPosition = { x, y };
    this.visitedCoordinates = [...this.visitedCoordinates, this.latestPosition];
    return this.matrix[x][y];
  }

  /*
    find if step was already visited
  */
  checkIfWasHere(currentPosition: Coordinates): boolean {
    if (this.visitedCoordinates.find(item => item.x === currentPosition.x && item.y === currentPosition.y)) {
      return true;
    } else {
      return false;
    }
  }
  /* #endregion */
}
