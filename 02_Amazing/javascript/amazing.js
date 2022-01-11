// AMAZING
//
// Originally converted from BASIC to Javascript by Oscar Toledo G. (nanochess)
//

/**
 * @TODO
 * Variable rename (entry, q, z)
 * canGoLeft / Up / Right / Down functions for readability?
 * Refactor into class
 * 0-based indexing
 * Process @TODO in code
 * Remove @DEBUG
 * Explore real refactoring
 */

const LEFT = 1;
const UP = 2;
const RIGHT = 3;
const DOWN = 4;

const WALLS_RIGHT_DOWN = 0;
const WALLS_RIGHT = 1;
const WALLS_DOWN = 2;
const WALLS_NONE = 3;

function print(str) {
    document.getElementById("output").appendChild(document.createTextNode(str));
}

function input(defaultValue) {
    return new Promise(function (resolve) {
        const input_element = document.createElement("INPUT");

        print("? ");
        input_element.setAttribute("type", "text");
        input_element.setAttribute("length", "50");
        input_element.setAttribute("value", defaultValue || "");
        document.getElementById("output").appendChild(input_element);
        input_element.focus();
        input_element.addEventListener("keydown", function (event) {
            if (event.keyCode === 13) {
                const input_str = input_element.value;
                document.getElementById("output").removeChild(input_element);
                print(input_str);
                print("\n");
                resolve(input_str);
            }
        });
    });
}

function tab(space) {
    let str = "";
    while (space-- > 0) {
        str += " ";
    }
    return str;
}

function printTitle() {
    print(tab(28) + "AMAZING PROGRAM\n");
    print(tab(15) + "CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY\n");
    print("\n");
    print("\n");
    print("\n");
    print("FOR EXAMPLE TYPE 10,10 AND PRESS ENTER\n");
    print("\n");
}

async function askForDimensions(defaultDimensions) {
    while (1) {
        print("WHAT ARE YOUR WIDTH AND LENGTH");
        const response = await input(defaultDimensions);
        const dimensions = response.split(",");
        if (dimensions[0] > 1 && dimensions[1] > 1)
            return dimensions;
        print("MEANINGLESS DIMENSIONS.  TRY AGAIN.\n");
    }
}

function initGrids(rows, columns) {
    const stepHistory = [];
    const walls = [];
    for (let i = 1; i <= columns; i++) {
        stepHistory[i] = [];
        walls[i] = [];

        for (j = 1; j <= rows; j++) {
            stepHistory[i][j] = 0;
            walls[i][j] = WALLS_RIGHT_DOWN;
        }
    }

    return [stepHistory, walls];
}

function canVisit(column, row, stepHistory) {
    return column >= 1 && column < stepHistory.length &&
        row >= 1 && row < stepHistory[1].length &&
        stepHistory[column][row] === 0
}

function isExplorationComplete(columns, rows, nextStepCounter) {
    return nextStepCounter === columns * rows + 1;
}

function printMaze(columns, rows, walls) {
    for (let j = 1; j <= rows; j++) {
        // Print the row's 'horizontal' walls
        let str = "I";
        for (let i = 1; i <= columns; i++) {
            if (walls[i][j] === WALLS_RIGHT_DOWN || walls[i][j] === WALLS_RIGHT)
                str += "  I";
            else
                str += "   ";
        }
        print(str + "\n");

        // Print the row's lower walls
        str = "";
        for (let i = 1; i <= columns; i++) {
            if (walls[i][j] === WALLS_RIGHT_DOWN || walls[i][j] === WALLS_DOWN)
                str += ":--";
            else
                str += ":  ";
        }
        print(str + ".\n");
    }
}

function printMazeAndLocation(columns, rows, walls, currentColumn, currentRow) {
    for (let j = 1; j <= rows; j++) {
        // Print the row's 'horizontal' walls
        let str = "I";
        for (let i = 1; i <= columns; i++) {
            let cellContent = currentColumn === i && currentRow === j ? '* ' : '  ';

            if (walls[i][j] === WALLS_RIGHT_DOWN || walls[i][j] === WALLS_RIGHT)
                str += cellContent + "I";
            else
                str += cellContent + " ";
        }
        print(str + "\n");

        // Print the row's lower walls
        str = "";
        for (let i = 1; i <= columns; i++) {
            if (walls[i][j] === WALLS_RIGHT_DOWN || walls[i][j] === WALLS_DOWN)
                str += ":--";
            else
                str += ":  ";
        }
        print(str + ".\n");
    }
}

function printVisitHistory(columns, rows, stepHistory) {
    for (let j = 1; j <= rows; j++) {
        let str = "I ";
        for (let i = 1; i <= columns; i++) {
            str += stepHistory[i][j] + " ";
        }
        print(str + "\n");
    }
}

function chooseDirection(options) {
    const index = Math.floor(Math.random() * options.length);
    return options[index];
}

// Main program
async function main() {
    const debugDimensions = "10,10"; // @DEBUG
    printTitle();
    const [columns, rows] = await askForDimensions(debugDimensions);
    print("\n");
    print("\n");
    print("\n");
    print("\n");

    const [stepHistory, walls] = initGrids(rows, columns);
    // stepHistory is a 2d grid of numbers which indicate the step on which I already visited each cell (or 0 for unvisited)
    // walls is a 2d grid of numbers which identify what walls each cell has

    // Choose a starting cell
    let startColumn = Math.floor(Math.random() * columns + 1);

    // Print the top row's vertical walls
    // startColumn represents the starting cell, so it's blank
    // All other cells in this direction are blocked
    for (i = 1; i <= columns; i++) {
        if (i === startColumn)
            print( ".  ");
        else
            print(".--");
    }
    print(".\n");

    let nextStepCounter = 1;  // Represents the 'step' number that the next cell we explore will have.
    stepHistory[startColumn][1] = nextStepCounter;
    nextStepCounter++;
    let currentColumn = startColumn;
    let currentRow = 1;

    let q = 0;  // Set when we can only go in one direction because we're at the bottom and we've visited all the ther non-down cells
    let z = 0;
    let entry = 0;  // This *could* be an indicator for where I can go next?
    /*
     * entry = 0: Set after walking left, up, or some paths of down. Permits walking left.
     * entry = 1: Set after walking right, I think to prevent from walking back left?
     * entry = 2: Fully blocked, a new current square needs to be found
     */

    while (1) {
        print("\nStep " + (nextStepCounter - 1) + "\n");
        printMazeAndLocation(columns, rows, walls, currentColumn, currentRow);
        print("\n");

        let nextDirection = DOWN;

        // We can't reach anywhere new from our current square,
        // so pick a different square we've already explored and start from there.
        if (entry === 2) {	// Search for a non-explored cell
            do {
                if (currentColumn < columns) {  // Check all cells in the current row for one we've explored. If not found, then ...
                    currentColumn++;
                } else if (currentRow < rows) { // ... then go down a row and try all those cells for one we've explored. If not found, then ...
                    currentColumn = 1;
                    currentRow++;
                } else {                        // ... start back in the top-left and go row by row, cell by cell for one we've explored.
                    currentColumn = 1;
                    currentRow = 1;
                }
            } while (stepHistory[currentColumn][currentRow] === 0) ;
        }

        // Decide where to go next.
        if (entry === 0 && canVisit(currentColumn - 1, currentRow, stepHistory)) {	// Can go left?
            const possibleDirections = [LEFT];
            if (canVisit(currentColumn, currentRow - 1, stepHistory)) {	// Can go up?
                possibleDirections.push(UP);
                if (canVisit(currentColumn + 1, currentRow, stepHistory)) {	// Can go right?
                    possibleDirections.push(RIGHT);
                } else if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] === 0) {	// Can go down?
                        possibleDirections.push(DOWN);
                    }
                } else if (z === 1) {
                    // No-op
                } else {
                    q = 1;
                    possibleDirections.push(DOWN);
                }
            } else if (canVisit(currentColumn + 1, currentRow, stepHistory)) {	// Can go right?
                possibleDirections.push(RIGHT);
                if (currentRow < rows) {
                    if (canVisit(currentColumn, currentRow + 1, stepHistory)) {	// Can go down?
                        possibleDirections.push(DOWN);
                    }
                } else if (z === 1) {
                    // No-op
                } else {
                    q = 1;
                    possibleDirections.push(DOWN);
                }
            } else if (currentRow < rows) {
                if (canVisit(currentColumn, currentRow + 1, stepHistory)) {	// Can go down?
                    possibleDirections.push(DOWN);
                }
            } else if (z === 1) {
                // No-op
            } else {
                q = 1;
                possibleDirections.push(DOWN);
            }

            nextDirection = chooseDirection(possibleDirections);
        } else if (canVisit(currentColumn, currentRow - 1, stepHistory)) {	// Can go up?
            const possibleDirections = [UP];
            if (canVisit(currentColumn + 1, currentRow, stepHistory)) { // Can go right?
                possibleDirections.push(RIGHT);
                if (currentRow < rows) {
                    if (canVisit(currentColumn, currentRow + 1, stepHistory)) {
                        possibleDirections.push(DOWN);
                    }
                } else if (z === 1) {
                    q = 1;
                } else {
                    possibleDirections.push(DOWN);
                }
            } else if (currentRow < rows) { // Can go down?
                if (canVisit(currentColumn, currentRow + 1, stepHistory)) {
                    possibleDirections.push(DOWN);
                }
            } else if (z === 1) {
                // No-op
            } else {
                q = 1;
                possibleDirections.push(DOWN);
            }

            nextDirection = chooseDirection(possibleDirections);
        } else if (canVisit(currentColumn + 1, currentRow, stepHistory)) {	// Can go right?
            const possibleDirections = [RIGHT];
            if (currentRow < rows) {
                if (canVisit(currentColumn, currentRow + 1, stepHistory)) {
                    possibleDirections.push(DOWN);
                }
            } else if (z === 1) {
                // no-op
            } else {
                q = 1;
                possibleDirections.push(DOWN);
            }

            nextDirection = chooseDirection(possibleDirections);
        } else if (currentRow < rows) {
            if (canVisit(currentColumn, currentRow + 1, stepHistory)) 	// Can go down?
                nextDirection = DOWN;
            else {
                entry = 2;	// Blocked!
                continue;
            }
        } else if (z === 1) {
            entry = 2;	// Blocked!
            continue;
        } else {
            q = 1;
            nextDirection = DOWN;
        }

        // Move to the next cell.
        if (nextDirection === LEFT) {
            stepHistory[currentColumn - 1][currentRow] = nextStepCounter;
            nextStepCounter++;
            walls[currentColumn - 1][currentRow] = WALLS_DOWN;
            currentColumn--;
            if (isExplorationComplete(columns, rows, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (nextDirection === UP) {
            stepHistory[currentColumn][currentRow - 1] = nextStepCounter;
            nextStepCounter++;
            walls[currentColumn][currentRow - 1] = WALLS_RIGHT;
            currentRow--;
            if (isExplorationComplete(columns, rows, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (nextDirection === RIGHT) {
            stepHistory[currentColumn + 1][currentRow] = nextStepCounter;
            nextStepCounter++;
            if (walls[currentColumn][currentRow] === WALLS_RIGHT_DOWN) {
                walls[currentColumn][currentRow] = WALLS_DOWN;
            } else {
                walls[currentColumn][currentRow] = WALLS_NONE;
            }

            currentColumn++;
            if (isExplorationComplete(columns, rows, nextStepCounter)) {
                break;
            }
            entry = 1;
        } else if (nextDirection === DOWN) {	// Down
            if (q !== 1) {	// Only if not blocked
                stepHistory[currentColumn][currentRow + 1] = nextStepCounter;
                nextStepCounter++;
                if (walls[currentColumn][currentRow] === WALLS_RIGHT_DOWN)
                    walls[currentColumn][currentRow] = WALLS_RIGHT;
                else
                    walls[currentColumn][currentRow] = WALLS_NONE;
                currentRow++;
                if (isExplorationComplete(columns, rows, nextStepCounter)) {
                    break;
                }
                entry = 0;
            } else {
                z = 1;
                if (walls[currentColumn][currentRow] === WALLS_RIGHT_DOWN) {
                    walls[currentColumn][currentRow] = WALLS_RIGHT;
                    q = 0;
                    currentColumn = 1;
                    currentRow = 1;
                    while (stepHistory[currentColumn][currentRow] === 0) {
                        if (currentColumn < columns) {
                            currentColumn++;
                        } else if (currentRow < rows) {
                            currentColumn = 1;
                            currentRow++;
                        } else {
                            currentColumn = 1;
                            currentRow = 1;
                        }
                    }
                    entry = 0;
                } else {
                    walls[currentColumn][currentRow] = WALLS_NONE;
                    q = 0;
                    entry = 2;
                }
            }
        }

        print(`Status: ${nextDirection}, ${q}, ${z}, ${entry}\n`);
    }

    // Output
    printMaze(columns, rows, walls);

    print("\nVisit history\n");
    printVisitHistory(columns, rows, stepHistory);
}

main();
