// reserves space for screen size changes, fully regens cells when phaseShift is triggered
function refreshCanvas() {
  clear();
  canvasSize = [];
  temp = resMenu.selected();
  treated = temp.split(",");
  treated[0] = parseInt(treated[0], 10);
  treated[1] = parseInt(treated[1], 10);
  canvasSize.push(treated[0]);
  canvasSize.push(treated[1]);
  //canvasSize = [canvasWidth, canvasHeight]
  canvasWidth = canvasSize[0];
  canvasHeight = canvasSize[1];
  console.log(canvasSize[0], canvasSize[1]);
  resizeCanvas(canvasSize[0], canvasSize[1]);
   
}

// quick value display for music data, sans advanced timing tools
function debugInfo(){
  push();
  fill(255)
  text ("counter: "+ counter, 100, 100);
  text ("vocal: "+ vocal, 100, 200);
  text ("drum: "+ drum, 100, 300);
  text ("bass: "+ bass, 100, 400);
  text ("other: "+ other, 100, 500);
  pop();
}

let colourTheme = 0;

let firstRun = true;
let phaseCheck = false;
let bassFade = false; // bass- driven "ghost" effect. uses alpha; can eat performance.
let fadeMax = 150; // when bassfade is true, lower value means more "ghosting"

let gridX = 20;
let gridY = 20;
let cellsX;
let cellsY;

let grid;
let cols;
let rows;
let resolution = 20; //are default res values necessary anymore? could give some options to user tbh

// need to refactor colour storage if I build a full style tool suite. Should be fun.
let colGreen = [80, 150, 90];
let colBlue = [50, 50, 100];
let colRed = [80, 50, 20];
let colApple = [240, 100, 80];
let colWhite = [255, 255, 255];
let colCream = [255, 255, 230];
let colBlack = [0, 0, 0];
let colYellow = [213, 219, 15];

//let aliveCol = [colGreen,colYellow,colBlack,colCream];
let deadCol = colBlack;
let current = 0;
let addSize = 0;

let appleSize = 0.5;

let sceneDuration = 130; // counter ticks (60/second) each scene lasts. supports updating during playback scope.
let maxRes = 50;

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

function draw_one_frame(words, vocal, drum, bass, other, counter) {
  // maybe update this + other menu options to update on reselection instead of each frame
  colourTheme = styleSelect.selected();

  ellipseMode(CENTER);
  rectMode(CENTER);

  let whiteCol = color(255, 255, 255);
  let whiteColAlpha = color(255, 255, 255, 50);
  let whiteColHighAlpha = color(255, 255, 255, 150);
  let appleCol = color(240, 100, 80);
  let greenCol = color(80, 150, 90);
  let yellowCol = color(213, 219, 15);
  let blackCol = color(0, 0, 0);
  let creamCol = color(255, 255, 230);
  let greyCol = color(150, 150, 150);
  let greyColTwo = color(100, 100, 100);

  // next steps: move as much out of these statements as possible to preserve individual changes, start building other themes
  if (colourTheme == 0) {
    deadCol = colBlack;
    maxRes = 50;
    //resolution = 20;
    sceneDuration = 130;
    //let al iveCol = [yellowCol,greenCol,creamCol,blackCol];
    let aliveCol = [whiteCol, greyColTwo, blackCol, greyCol];

    let resMap = map(other, 0, 100, 80, 10, true); //unused
    let colShift = map(drum, 0, 100, 0, 2, true);
    let bassMap = map(vocal, 0, 100, 0, 0.5, true);

    let shiftedCol = lerpColor(whiteCol, aliveCol[current], colShift);

    if (counter % sceneDuration == 0 && counter != 0) {
      phaseCheck = true;
      resolution += 10;
      if (resolution >= maxRes) {
        resolution = 20;
      }
      current++;
      if (current >= aliveCol.length) {
        current = 0;
      }
    }

    if (firstRun || phaseCheck) {
      refreshCanvas();

      // push();
      // fill(deadCol);
      // noStroke();
      // rect(canvasWidth/2,canvasHeight/2,canvasWidth,canvasHeight)
      // pop();
      cols = round(canvasWidth / resolution); //very important to round these to account for math error in dividing canvas
      rows = round(canvasHeight / resolution);
      grid = make2DArray(cols, rows);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (drum > 60) {
            grid[i][j] = Math.floor(random(2));
          } else {
            grid[i][j] = Math.floor(random(8) / 7);
          }
        }
      }
      firstRun = false;
      phaseCheck = false;
    }

    if (bassFade) {
      let bassFade = map(bass, 0, 100, fadeMax, 0, true);
      deadCol.push(bassFade);
      background(deadCol);
      deadCol.pop();
    } else {
      background(deadCol);
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution;
        let y = j * resolution;
        if (grid[i][j] == 1) {
          push();
          //fill(aliveCol[current]);
          fill(shiftedCol);
          if (vocal > 60) {
            appleSize = random(0.6, 1);
          } else if (vocal > 50) {
            appleSize = random(0.5, 0.8);
          } else if (vocal > 40) {
            appleSize = 0.5;
          } else if (vocal > 20) {
            appleSize = random(0.3, 0.4);
          } else {
            appleSize = 0.2;
          }
          //stroke(bass*5);

          //strokeWeight(drum/40)
          //circle(x,y,((resolution+5)* appleSize))
          rect(x, y, (resolution - 1) * appleSize * 1.1);
          stroke(colWhite);
          strokeWeight(bassMap * 0.5);
          noFill();
          rect(x, y, (resolution - 1) * 2);

          strokeWeight(bassMap * 0.1);
          rect(x, y, (resolution - 1) * 3);
          if (drum < 65 || bass < 38) {
            stroke(bass);
            strokeWeight(0.01 * vocal);
            line(x - 50, y, x + 50, y);
            line(x, y - 50, x, y + 50);
            if ((drum > 55 && drum < 65) || (bass > 28 && bass < 38)) {
              strokeWeight(0.2 * bassMap);
              stroke(whiteColAlpha);
              rect(x, y, (resolution - 1) * 40 * bassMap);
            }
          }

          pop();
        }
      }
    }

    let next = make2DArray(cols, rows);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = grid[i][j];
        // Count live neighbors!
        let sum = 0;
        let neighbours = countNeighbours(grid, i, j);

        if (state == 0 && neighbours == 3) {
          stroke(whiteColHighAlpha);
          if (bass > 80) {
            push();
            strokeWeight(0.1);
            noFill();
            rect(i * resolution, j * resolution, (resolution - 1) * 4);
            pop();
          }
          line(
            i * resolution - 20,
            j * resolution,
            i * resolution + 20,
            j * resolution,
          );
          line(
            i * resolution,
            j * resolution - 20,
            i * resolution,
            j * resolution + 20,
          );
          next[i][j] = 1;
        } else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
          //addSize -=1;

          next[i][j] = 0;
        } else {
          //addSize -=1;

          next[i][j] = state;
        }
      }
    }
    // iterates the GOL based on a rate that is the product of audio activity
    if (
      (drum >= 40 && counter % 5 == 0) ||
      (vocal >= 45 && counter % 10 == 0) ||
      (bass >= 60 && counter % 10 == 0) ||
      (other >= 65 && counter % 20 == 0)
    ) {
      grid = next;
    }
  } else if (colourTheme == 1) {
    deadCol = colBlack;
    //resolution = 20;
    maxRes = 50;
    sceneDuration = 240;

    let aliveCol = [yellowCol, greenCol, creamCol, blackCol];

    let resMap = map(other, 0, 100, 80, 10, true); //unused
    let colShift = map(drum, 0, 100, 0, 0.8, true);

    let shiftedCol = lerpColor(appleCol, aliveCol[current], colShift);

    if (counter % 240 == 0 && counter != 0) {
      phaseCheck = true;
      resolution += 10;
      if (resolution >= maxRes) {
        resolution = 20;
      }
      current++;
      if (current >= aliveCol.length) {
        current = 0;
      }
    }

    if (firstRun || phaseCheck) {
      cols = round(canvasWidth / resolution);
      rows = round(canvasHeight / resolution);
      grid = make2DArray(cols, rows);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          grid[i][j] = Math.floor(random(2));
        }
      }
      firstRun = false;
      phaseCheck = false;
    }
    let bassFade = map(bass, 0, 100, 100, 0, true);
    deadCol.push(bassFade);
    background(deadCol);
    deadCol.pop();

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution;
        let y = j * resolution;
        if (grid[i][j] == 1) {
          //fill(aliveCol[current]);
          fill(shiftedCol);
          let appleSize = random(0, 1);
          //stroke(bass*5);
          noStroke();
          //strokeWeight(drum/40)
          circle(x, y, (resolution + 5) * appleSize);
          rect(x, y, (resolution - 1) * appleSize);
        }
      }
    }

    let next = make2DArray(cols, rows);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = grid[i][j];
        // Count live neighbors!
        let sum = 0;
        let neighbours = countNeighbours(grid, i, j);

        if (state == 0 && neighbours == 3) {
          next[i][j] = 1;
        } else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
          next[i][j] = 0;
        } else {
          next[i][j] = state;
        }
      }
    }
    // iterates the GOL based on a rate that is the product of audio activity
    if (
      (drum >= 40 && counter % 5 == 0) ||
      (vocal >= 45 && counter % 10 == 0) ||
      (bass >= 60 && counter % 20 == 0) ||
      (other >= 65 && counter % 20 == 0)
    ) {
      grid = next;
    }
  } else if (colourTheme == 2) {
    sceneDuration = 540;
    maxRes = 40;
    //resolution = 10;

    aliveCol = [colGreen, colRed, colBlue, colWhite];
    deadCol = [255, 255, 230];

    let resMap = map(other, 0, 100, 80, 10);

    if (counter % sceneDuration == 0 && counter != 0) {
      phaseCheck = true;
      resolution += 10;
      if (resolution >= maxRes) {
        resolution = 10;
      }
      current++;
      if (current >= aliveCol.length) {
        current = 0;
      }
    }

    if (firstRun || phaseCheck) {
      cols = round(canvasWidth / resolution);
      rows = round(canvasHeight / resolution);
      grid = make2DArray(cols, rows);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          grid[i][j] = Math.floor(random(2));
        }
      }
      firstRun = false;
      phaseCheck = false;
    }
    let bassFade = map(bass, 0, 100, 100, 0, true);
    deadCol.push(bassFade);
    background(deadCol);
    deadCol.pop();

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution;
        let y = j * resolution;
        if (grid[i][j] == 1) {
          fill(aliveCol[current]);
          stroke(bass * 5);
          strokeWeight(drum / 20);
          rect(x, y, resolution - 1, resolution - 1);
        }
      }
    }

    let next = make2DArray(cols, rows);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = grid[i][j];
        // Count live neighbors!
        let sum = 0;
        let neighbours = countNeighbours(grid, i, j);

        if (state == 0 && neighbours == 3) {
          next[i][j] = 1;
        } else if (state == 1 && (neighbours < 2 || neighbours > 3)) {
          next[i][j] = 0;
        } else {
          next[i][j] = state;
        }
      }
    }
    // iterates the GOL based on a rate that is the product of audio activity
    if (
      (drum >= 40 && counter % 5 == 0) ||
      (vocal >= 45 && counter % 15 == 0) ||
      (bass >= 60 && counter % 20 == 0) ||
      (other >= 65 && counter % 25 == 0)
    ) {
      grid = next;
    }
  } else {
    console.log(`invalid style option: ${colourTheme}`);
  }
  //debugInfo();
}

// constructor for cell array (current and next)
function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

// check how many current "active/alive" neighbours a cell has, return int sum to decide how it advances in next
function countNeighbours(grid, x, y) {
  let sum = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  sum -= grid[x][y];
  return sum;
}
