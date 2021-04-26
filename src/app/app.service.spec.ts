import { TestBed } from '@angular/core/testing';
import { AppService } from './app.service';
import { MapRequest } from './map-request';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppService);
  });

  it('service should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Success testing', () => {
    it("submitASCIIMap should pass 'basic example'", (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `@---A---+
        |
x-B-+   C
    |   |
    +---+
        `
      };
      service.submitASCIIMap(formData).subscribe(response => {
        expect(response).toEqual({ letters: 'ACB', pathAsCharacters: '@---A---+|C|+---+|+-B-x' });
        done();
      })
    });

    it("submitASCIIMap should pass 'go straight through intersections' example", (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea:
          `@
| +-C--+
A |    |
+---B--+
  |      x
  |      |
  +---D--+`
      };
      service.submitASCIIMap(formData).subscribe(response => {
        expect(response).toEqual({ letters: 'ABCD', pathAsCharacters: '@|A+---B--+|+--C-+|||+---D--+|x' });
        done();
      })
    });

    it("submitASCIIMap should pass 'letters may be found on turns' example", (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `  @---A---+
          |
  x-B-+   |
      |   |
      +---C`
      };
      service.submitASCIIMap(formData).subscribe(response => {
        expect(response).toEqual({ letters: 'ACB', pathAsCharacters: '@---A---+|||C---+|+-B-x' });
        done();
      })
    });

    it("submitASCIIMap should pass do not collect a letter from the same location twice' example", (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `    +--B--+
    |   +-B-+
 @--A-+ | | |
    | | +-+ A
    +-+     |
            x`
      };
      service.submitASCIIMap(formData).subscribe(response => {
        expect(response).toEqual({ letters: 'ABBA', pathAsCharacters: '@--A-+|+-+||+--B--+B|+-+|+--+|A|x' });
        done();
      })
    });

    it("submitASCIIMap should pass 'keep direction, even in a compact space' example", (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: ` +-B-+
 |  +C-+
@A+ ++ D
 ++    x`
      };
      service.submitASCIIMap(formData).subscribe(response => {
        expect(response).toEqual({ letters: 'ABCD', pathAsCharacters: '@A+++|+-B-+C+++-+Dx' });
        done();
      })
    });
  })

  /* #region  Success testing scenarios */
  /* #endregion */

  /* #region  Error testing scenarios */
  describe('Error scenarios', () => {
    it('submitASCIIMap should result in error in case of empty request', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: ``
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Textarea is empty');
          done();
        }
      })
    });

    it('submitASCIIMap should result in error in case of no start', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `     -A---+
          |
    x-B-+   C
      |   |
      +---+`
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Error');
          done();
        }
      })
    });

    it('submitASCIIMap should result in error in case of no end', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `   @--A---+
          |
    B-+   C
      |   |
      +---+`
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Error');
          done();
        }
      })
    });

    it('submitASCIIMap should result in error in case of multiple starts', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `   @--A-@-+
          |
    x-B-+   C
      |   |
      +---+`
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Error');
          done();
        }
      })
    });

    it('submitASCIIMap should result in error in case of multiple ends', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `   @--A---+
          |
    x-Bx+   C
      |   |
      +---+`
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Error');
          done();
        }
      })
    });

    it('submitASCIIMap should result in error in case of T forks', (done: DoneFn) => {
      const formData: MapRequest = {
        file: null,
        textArea: `        x-B
          |
    @--A---+
          |
     x+   C
      |   |
      +---+`
      };
      service.submitASCIIMap(formData).subscribe({
        error: (err) => {
          expect(err).toEqual('Error');
          done();
        }
      })
    });
  })
  /* #endregion */
});
