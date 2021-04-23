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
  previouslyVisited: Coordinates[] = [];
  /* #endregion */

  /* #region  Service methods */
  // Submit map method
  submitASCIIMap(formData: MapRequest): Observable<string> {
    if (formData.file && formData.file.type !== "text/plain") return throwError("File type has to be .txt ~ text.plain");
    return this.solveMapAlgorithm(formData);
  }

  solveMapAlgorithm(formData: MapRequest): Observable<string> {
    this.nextStepDirection = "/";
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
    let it = 0;
    while (it < algorithm.length) {
      this.letters += this.getFurtherDirAndChar(this.latestPosition.x, this.latestPosition.y);
      it++;
    }
    return from([this.letters.replace(/false/g, "")]);
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
    let endOccurences = 0;
    this.algorithmMatrix.forEach((row, y) => {
      const x = row.findIndex(element => element === "@");
      const end = row.findIndex(element => element === "x");
      if (x > -1) {
        startCoordinates = [...startCoordinates, { y, x }];
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
      console.log("usao gore")
    } else if (this.nextStepDirection === "B") {
      char = <string>this.lookBottom(x, y);
      console.log("usao dole")
    } else {
      console.log("usao u else", this.previouslyVisited, { x, y })
      char = this.lookLeft(x, y)
        ? <string>this.lookLeft(x, y) : this.lookRight(x, y)
          ? <string>this.lookRight(x, y) : this.lookTop(x, y)
            ? <string>this.lookTop(x, y) : this.lookBottom(x, y)
              ? <string>this.lookBottom(x, y) : "";
    }
    return char;
  }


  lookBottom(x: number, y: number): string | boolean {
    // fails in case of undefined and EMPTY string
    if (this.algorithmMatrix[x + 1] && !this.checkIfWasHere({ x: x + 1, y })) {
      if (this.algorithmMatrix[x + 1][y] === DIRECTIONS.downOrUp) {
        this.nextStepDirection = "B";
        this.latestPosition = { x: x + 1, y: y }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x + 1][y];
      } else if (this.algorithmMatrix[x + 1][y] === DIRECTIONS.corner) {
        this.nextStepDirection = "/";
        this.latestPosition = { x: x + 1, y: y }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x + 1][y];
      } else if (this.nextStepDirection === "B") {
        if (/^[a-zA-Z]+$/.test(this.algorithmMatrix[x + 1][y])) {
          this.latestPosition = { x: x + 1, y: y }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x + 1][y];
        } else if (this.algorithmMatrix[x + 1][y] === "x") {
          this.nextStepDirection = "end";
          this.latestPosition = { x: x + 1, y: y }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x + 1][y];
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
        this.nextStepDirection = "T";
        this.latestPosition = { x: x - 1, y: y }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x - 1][y];
      } else if (this.algorithmMatrix[x - 1][y] === DIRECTIONS.corner) {
        this.nextStepDirection = "/";
        this.latestPosition = { x: x - 1, y: y }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x - 1][y];
      } else if (this.nextStepDirection === "T") {
        if (/^[a-zA-Z]+$/.test(this.algorithmMatrix[x - 1][y])) {
          this.latestPosition = { x: x - 1, y: y }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x - 1][y];
        } else if (this.algorithmMatrix[x - 1][y] === "x") {
          this.nextStepDirection = "end";
          this.latestPosition = { x: x - 1, y: y }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x - 1][y];
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
        this.nextStepDirection = "L";
        this.latestPosition = { x: x, y: y - 1 }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x][y - 1];
      } else if (this.algorithmMatrix[x][y - 1] === DIRECTIONS.corner) {
        this.nextStepDirection = "/";
        this.latestPosition = { x: x, y: y - 1 }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x][y - 1];
      } else if (this.nextStepDirection === "L") {
        if (/^[a-zA-Z]+$/.test(this.algorithmMatrix[x][y - 1])) {
          this.latestPosition = { x: x, y: y - 1 }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x][y - 1];
        } else if (this.algorithmMatrix[x][y - 1] === "x") {
          this.nextStepDirection = "end";
          this.latestPosition = { x: x, y: y - 1 }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x][y - 1];
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
        this.nextStepDirection = "R";
        this.latestPosition = { x: x, y: y + 1 }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x][y + 1];
      } else if (this.algorithmMatrix[x][y + 1] === DIRECTIONS.corner) {
        this.nextStepDirection = "/";
        this.latestPosition = { x: x, y: y + 1 }
        this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
        return this.algorithmMatrix[x][y + 1];
      } else if (this.nextStepDirection === "R") {
        if (/^[a-zA-Z]+$/.test(this.algorithmMatrix[x][y + 1])) {
          this.latestPosition = { x: x, y: y + 1 }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x][y + 1];
        } else if (this.algorithmMatrix[x][y + 1] === "x") {
          this.nextStepDirection = "end";
          this.latestPosition = { x: x, y: y + 1 }
          this.previouslyVisited = [...this.previouslyVisited, this.latestPosition];
          return this.algorithmMatrix[x][y + 1];
        }
      } else {
        return false;
      }
    }
    return false;
  }

  checkIfWasHere(currentPosition: Coordinates): boolean {
    if (this.previouslyVisited.find(item => item.x === currentPosition.x && item.y === currentPosition.y)) {
      return true;
    } else {
      return false;
    }
  }

  /* #endregion */
}
