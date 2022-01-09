// AMAZING
//
// Originally converted from BASIC to Javascript by Oscar Toledo G. (nanochess)
//

/**
 * @TODO
 * Collapse branches around which options to choose from into a collection array that chooses one at the end
 * Variable rename
 * Refactor into functions
 * 0-based indexing
 * Process @TODO in code
 * Remove @DEBUG
 * Explore real refactoring
 */

const LEFT = 1;
const UP = 2;
const RIGHT = 3;
const DOWN = 4;

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

// @TODO Rename this function (probably)
function initGrids(rows, columns) {
    const stepHistory = [];
    const v = [];
    for (let i = 1; i <= columns; i++) {
        stepHistory[i] = [];
        v[i] = [];

        for (j = 1; j <= rows; j++) {
            stepHistory[i][j] = 0;
            v[i][j] = 0;
        }
    }

    return [stepHistory, v];
}

function isExplorationComplete(rows, columns, nextStepCounter) {
    return nextStepCounter === columns * rows + 1;
}

function printMaze(rows, columns, cellWalls) {
    for (let j = 1; j <= rows; j++) {
        // Print the row's 'horizontal' walls
        let str = "I";
        for (let i = 1; i <= columns; i++) {
            if (cellWalls[i][j] < 2)
                str += "  I";
            else
                str += "   ";
        }
        print(str + "\n");

        // Print the row's lower walls
        str = "";
        for (let i = 1; i <= columns; i++) {
            if (cellWalls[i][j] === 0 || cellWalls[i][j] === 2)
                str += ":--";
            else
                str += ":  ";
        }
        print(str + ".\n");
    }
}

function printVisitHistory(rows, columns, stepHistory) {
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
    const debugDimensions = "3,3"; // @DEBUG
    printTitle();
    const [columns, rows] = await askForDimensions(debugDimensions);
    print("\n");
    print("\n");
    print("\n");
    print("\n");

    const [stepHistory, v] = initGrids(rows, columns);
    // stepHistory is a 2d grid of numbers which indicate the step on which I already visited each cell (or 0 for unvisited)
    // 'v' is a 2d grid of numbers which identify what walls each cell has
    // v === 0: Right wall, bottom wall
    // v === 1: Right wall
    // v === 2: Bottom wall

    // Choose a starting cell
    let startColumn = Math.floor(Math.random() * columns + 1);
    let q = 0;
    let z = 0;

    // Print the top row's vertical walls
    // startColumn represents the starting cell, so it's blank
    // All other cells in this direction are blocked
    for (i = 1; i <= columns; i++) {
        if (i === startColumn)
            print(".  ");
        else
            print(".--");
    }
    print(".\n");

    let nextStepCounter = 1;  // Represents the 'step' number that the next cell we explore will have.
    stepHistory[startColumn][1] = nextStepCounter;
    nextStepCounter++;
    let currentColumn = startColumn;
    let currentRow = 1;
    let entry = 0;  // This *could* be an indicator for where I can go next
    while (1) {
        let nextDirection = 4;

        // We can't reach anywhere new from our current square,
        // so pick a different square we've already explored and start from there.
        if (entry === 2) {	// Search for a non-explored cell
            do {
                if (currentColumn < columns) {
                    currentColumn++;
                } else if (currentRow < rows) {
                    currentColumn = 1;
                    currentRow++;
                } else {
                    currentColumn = 1;
                    currentRow = 1;
                }
            } while (stepHistory[currentColumn][currentRow] === 0) ;
        }

        // Decide where to go next.
        if (entry === 0 && currentColumn - 1 > 0 && stepHistory[currentColumn - 1][currentRow] === 0) {	// Can go left?
            if (currentRow - 1 > 0 && stepHistory[currentColumn][currentRow - 1] === 0) {	// Can go up?
                if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] === 0) {	// Can go right?
                    nextDirection = chooseDirection([LEFT, UP, RIGHT]);
                } else if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] === 0) {	// Can go down?
                        nextDirection = chooseDirection([LEFT, UP, DOWN]);
                    } else {
                        nextDirection = chooseDirection([LEFT, UP]);
                    }
                } else if (z === 1) {
                    nextDirection = chooseDirection([LEFT, UP]);
                } else {
                    q = 1;
                    nextDirection = chooseDirection([LEFT, UP, DOWN]);
                }
            } else if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] === 0) {	// Can go right?
                if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] === 0) {	// Can go down?
                        nextDirection = chooseDirection([LEFT, RIGHT, DOWN]);
                    } else {
                        nextDirection = chooseDirection([LEFT, RIGHT]);
                    }
                } else if (z === 1) {
                    nextDirection = chooseDirection([LEFT, RIGHT]);
                } else {
                    q = 1;
                    nextDirection = chooseDirection([LEFT, RIGHT, DOWN]);
                }
            } else if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] === 0) {	// Can go down?
                    nextDirection = chooseDirection([LEFT, DOWN]);
                } else {
                    nextDirection = LEFT;
                }
            } else if (z === 1) {
                nextDirection = LEFT;
            } else {
                q = 1;
                nextDirection = chooseDirection([LEFT, DOWN]);
            }
        } else if (currentRow - 1 > 0 && stepHistory[currentColumn][currentRow - 1] === 0) {	// Can go up?
            if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] === 0) {
                if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] === 0)
                        nextDirection = chooseDirection([UP, RIGHT, DOWN]);
                    else
                        nextDirection = chooseDirection([UP, RIGHT]);
                } else if (z === 1) {
                    nextDirection = chooseDirection([UP, RIGHT]);
                    q = 1;
                } else {
                    nextDirection = chooseDirection([UP, RIGHT, DOWN]);
                }
            } else if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] === 0) {
                    nextDirection = chooseDirection([UP, DOWN]);
                } else {
                    nextDirection = UP;
                }
            } else if (z === 1) {
                nextDirection = UP;
            } else {
                q = 1;
                nextDirection = chooseDirection([UP, DOWN]);
            }
        } else if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] === 0) {	// Can go right?
            if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] === 0)
                nextDirection = chooseDirection([RIGHT, DOWN]);
                else
                    nextDirection = RIGHT;
            } else if (z === 1) {
                nextDirection = RIGHT;
            } else {
                q = 1;
                nextDirection = chooseDirection([RIGHT, DOWN]);
            }
        } else if (currentRow < rows) {
            if (stepHistory[currentColumn][currentRow + 1] === 0) 	// Can go down?
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
            v[currentColumn - 1][currentRow] = 2;
            currentColumn--;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (nextDirection === UP) {
            stepHistory[currentColumn][currentRow - 1] = nextStepCounter;
            nextStepCounter++;
            v[currentColumn][currentRow - 1] = 1;
            currentRow--;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (nextDirection === RIGHT) {
            stepHistory[currentColumn + 1][currentRow] = nextStepCounter;
            nextStepCounter++;
            if (v[currentColumn][currentRow] === 0)
                v[currentColumn][currentRow] = 2;
            else
                v[currentColumn][currentRow] = 3;
            currentColumn++;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            entry = 1;
        } else if (nextDirection === DOWN) {	// Down
            if (q !== 1) {	// Only if not blocked
                stepHistory[currentColumn][currentRow + 1] = nextStepCounter;
                nextStepCounter++;
                if (v[currentColumn][currentRow] === 0)
                    v[currentColumn][currentRow] = 1;
                else
                    v[currentColumn][currentRow] = 3;
                currentRow++;
                if (isExplorationComplete(rows, columns, nextStepCounter)) {
                    break;
                }
                entry = 0;
            } else {
                z = 1;
                if (v[currentColumn][currentRow] === 0) {
                    v[currentColumn][currentRow] = 1;
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
                    v[currentColumn][currentRow] = 3;
                    q = 0;
                    entry = 2;
                }
            }
        }
    }

    // Output
    printMaze(rows, columns, v);

    print("\nVisit history\n");
    printVisitHistory(rows, columns, stepHistory);
}

main();
