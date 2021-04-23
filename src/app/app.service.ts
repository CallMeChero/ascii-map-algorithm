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
  nextStepDirection: string;
  latestPosition: Coordinates;
  letters: string = "";
  visitedCoordinates: Coordinates[] = [];
  /* #endregion */

  /* #region  Service methods */
  // Submit map method
  submitASCIIMap(formData: MapRequest): Observable<string> {
    //re-init for new api call
    this.nextStepDirection = "/";
    this.letters = "";
    this.visitedCoordinates = [];

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
    this.latestPosition = start;
    // todo
    while (this.nextStepDirection !== "end") {
      this.letters += this.findCharacter(this.latestPosition.x, this.latestPosition.y);
    }
    return from([this.letters]);
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
    console.log(this.algorithmMatrix)
  }

  /*
   find out where is start
   in case of error throw it
  */
  getStartCoordinates(): Coordinates | Observable<never> {
    // find out where is algorithm starting
    let startCoordinates = [];
    let endOccurences = 0;
    this.algorithmMatrix.forEach((row, x) => {
      const y = row.findIndex(element => element === "@");
      const end = row.findIndex(element => element === "x");
      if (y > -1) {
        startCoordinates = [...startCoordinates, { x, y }];
      }
      if (end > -1) {
        endOccurences++;
      }
    });
    // in case of multiple starts throw error
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
    check if its letter or character
    if letter, find direction and next one
    if character(other than @) find next one
  */
  findCharacter(x: number, y: number) {
    return this.getFurtherDirAndChar(x, y);
  }

  getFurtherDirAndChar(x: number, y: number) {
    let char: string;
    if (this.nextStepDirection === "L") {
      char = <string>this.lookLeft(x, y);
      return char;
    } else if (this.nextStepDirection === "R") {
      char = <string>this.lookRight(x, y);
      return char;
    } else if (this.nextStepDirection === "T") {
      char = <string>this.lookTop(x, y);
      return char;
    } else if (this.nextStepDirection === "B") {
      char = <string>this.lookBottom(x, y);
      return char;
    } else {
      let charL = this.lookLeft(x, y);
      let charR = this.lookRight(x, y);
      let charT = this.lookTop(x, y);
      let charB = this.lookBottom(x, y);
      return charL ? charL : charB ? charB : charT ? charT : charR ? charR : undefined;
    }
  }


  lookBottom(x: number, y: number): string | boolean {
    // fails in case of undefined and EMPTY string
    if (this.algorithmMatrix[x + 1] && !this.checkIfWasHere({ x: x + 1, y })) {
      if (this.algorithmMatrix[x + 1][y] === DIRECTIONS.downOrUp) {
        return this.setPositionAndDirection(x + 1, y, "B");
      } else if (this.algorithmMatrix[x + 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x + 1, y, "/");
      } else if (this.nextStepDirection === "B") {
        if (/^[A-Z]+$/.test(this.algorithmMatrix[x + 1][y])) {
          return this.setPositionAndDirection(x + 1, y, "B");
        } else if (this.algorithmMatrix[x + 1][y] === "x") {
          return this.setPositionAndDirection(x + 1, y, "end");
        }
      } else {
        return false;
      }
    }
    return false;
  }

  lookTop(x: number, y: number): string | boolean {
    // fails in case of undefined and EMPTY string
    if (this.algorithmMatrix[x - 1] && !this.checkIfWasHere({ x: x - 1, y })) {
      if (this.algorithmMatrix[x - 1][y] === DIRECTIONS.downOrUp) {
        return this.setPositionAndDirection(x - 1, y, "T");
      } else if (this.algorithmMatrix[x - 1][y] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x - 1, y, "/");
      } else if (this.nextStepDirection === "T") {
        if (/^[A-Z]+$/.test(this.algorithmMatrix[x - 1][y])) {
          return this.setPositionAndDirection(x - 1, y, "T");
        } else if (this.algorithmMatrix[x - 1][y] === "x") {
          return this.setPositionAndDirection(x - 1, y, "end");
        }
      } else {
        return false;
      }
    }
    return false;
  }

  lookLeft(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x][y - 1] && !this.checkIfWasHere({ x, y: y - 1 })) {
      if (this.algorithmMatrix[x][y - 1] === DIRECTIONS.leftOrRight) {
        return this.setPositionAndDirection(x, y - 1, "L");
      } else if (this.algorithmMatrix[x][y - 1] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x, y - 1, "/");
      } else if (this.nextStepDirection === "L") {
        if (/^[A-Z]+$/.test(this.algorithmMatrix[x][y - 1])) {
          return this.setPositionAndDirection(x, y - 1, "L");
        } else if (this.algorithmMatrix[x][y - 1] === "x") {
          return this.setPositionAndDirection(x, y - 1, "end");
        }
      } else {
        return false;
      }
    }
    return false;
  }

  lookRight(x: number, y: number): string | boolean {
    if (this.algorithmMatrix[x][y + 1] && !this.checkIfWasHere({ x, y: y + 1 })) {
      if (this.algorithmMatrix[x][y + 1] === DIRECTIONS.leftOrRight) {
        return this.setPositionAndDirection(x, y + 1, "R");
      } else if (this.algorithmMatrix[x][y + 1] === DIRECTIONS.corner) {
        return this.setPositionAndDirection(x, y + 1, "/");
      } else if (this.nextStepDirection === "R") {
        if (/^[A-Z]+$/.test(this.algorithmMatrix[x][y + 1])) {
          return this.setPositionAndDirection(x, y + 1, "R");
        } else if (this.algorithmMatrix[x][y + 1] === "x") {
          return this.setPositionAndDirection(x, y + 1, "end");
        }
      } else {
        return false;
      }
    }
    return false;
  }

  setPositionAndDirection(x: number, y: number, direction: string): string {
    this.nextStepDirection = direction;
    this.latestPosition = { x, y };
    this.visitedCoordinates = [...this.visitedCoordinates, this.latestPosition];
    return this.algorithmMatrix[x][y];
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
