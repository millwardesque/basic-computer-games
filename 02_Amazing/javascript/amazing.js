// AMAZING
//
// Originally converted from BASIC to Javascript by Oscar Toledo G. (nanochess)
//

/**
 * @TODO
 * Variable rename
 * Refactor into functions
 * 0-based indexing
 * Process @TODO in code
 * Remove @DEBUG
 * Explore real refactoring
 */

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
            if (event.keyCode == 13) {
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
    return nextStepCounter == columns * rows + 1;
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
            if (cellWalls[i][j] == 0 || cellWalls[i][j] == 2)
                str += ":--";
            else
                str += ":  ";
        }
        print(str + ".\n");
    }
}

function printVisitHistory(rows, columns, stepHistory) {
    for (let j = 1; j <= rows; j++) {
        let str = "I";
        for (let i = 1; i <= columns; i++) {
            str += stepHistory[i][j] + " ";
        }
        print(str + "\n");
    }
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
    // v == 0: Right wall, bottom wall
    // v == 1: Right wall
    // v == 2: Bottom wall

    // Choose a starting cell
    let nextColumn = Math.floor(Math.random() * columns + 1);
    let q = 0;
    let z = 0;

    // Print the top row's vertical walls
    // X represents the starting cell, so it's blank
    // All other cells in this direction are blocked
    for (i = 1; i <= columns; i++) {
        if (i == nextColumn)
            print(".  ");
        else
            print(".--");
    }
    print(".\n");


    let nextStepCounter = 1;  // Next-step order. Its current value is the 'step' number that the next cell we explore will have.
    stepHistory[nextColumn][1] = nextStepCounter;
    nextStepCounter++;
    let currentColumn = nextColumn;
    let currentRow = 1;
    let entry = 0;  // This *could* be an indicator for where I can go next
    let x = nextColumn; // @DEBUG Used for backwards compatibility because there's a lot of 'x' references that need to be updated to nextColumn
    while (1) {
        if (entry == 2) {	// Search for a non-explored cell
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
            } while (stepHistory[currentColumn][currentRow] == 0) ;
        }
        if (entry == 0 && currentColumn - 1 > 0 && stepHistory[currentColumn - 1][currentRow] == 0) {	// Can go left?
            if (currentRow - 1 > 0 && stepHistory[currentColumn][currentRow - 1] == 0) {	// Can go up?
                if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] == 0) {	// Can go right?
                    // Choose left/up/right
                    x = Math.floor(Math.random() * 3 + 1);
                } else if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] == 0) {	// Can go down?
                        // Choose left/up/down
                        x = Math.floor(Math.random() * 3 + 1);
                        if (x == 3)
                            x = 4;
                    } else {
                        x = Math.floor(Math.random() * 2 + 1);
                    }
                } else if (z == 1) {
                    x = Math.floor(Math.random() * 2 + 1);
                } else {
                    q = 1;
                    x = Math.floor(Math.random() * 3 + 1);
                    if (x == 3)
                        x = 4;
                }
            } else if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] == 0) {	// Can go right?
                if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] == 0) {	// Can go down?
                        // Choose left/right/down
                        x = Math.floor(Math.random() * 3 + 1);
                    } else {
                        x = Math.floor(Math.random() * 2 + 1);
                    }
                    if (x >= 2)
                        x++;
                } else if (z == 1) {
                    x = Math.floor(Math.random() * 2 + 1);
                    if (x >= 2)
                        x++;
                } else {
                    q = 1;
                    x = Math.floor(Math.random() * 3 + 1);
                    if (x >= 2)
                        x++;
                }
            } else if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] == 0) {	// Can go down?
                    // Choose left/down
                    x = Math.floor(Math.random() * 2 + 1);
                    if (x == 2)
                        x = 4;
                } else {
                    x = 1;
                }
            } else if (z == 1) {
                x = 1;
            } else {
                q = 1;
                x = Math.floor(Math.random() * 2 + 1);
                if (x == 2)
                    x = 4;
            }
        } else if (currentRow - 1 > 0 && stepHistory[currentColumn][currentRow - 1] == 0) {	// Can go up?
            if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] == 0) {
                if (currentRow < rows) {
                    if (stepHistory[currentColumn][currentRow + 1] == 0)
                        x = Math.floor(Math.random() * 3 + 2);
                    else
                        x = Math.floor(Math.random() * 2 + 2);
                } else if (z == 1) {
                    x = Math.floor(Math.random() * 2 + 2);
                } else {
                    q = 1;
                    x = Math.floor(Math.random() * 3 + 2);
                }
            } else if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] == 0) {
                    x = Math.floor(Math.random() * 2 + 2);
                    if (x == 3)
                        x = 4;
                } else {
                    x = 2;
                }
            } else if (z == 1) {
                x = 2;
            } else {
                q = 1;
                x = Math.floor(Math.random() * 2 + 2);
                if (x == 3)
                    x = 4;
            }
        } else if (currentColumn < columns && stepHistory[currentColumn + 1][currentRow] == 0) {	// Can go right?
            if (currentRow < rows) {
                if (stepHistory[currentColumn][currentRow + 1] == 0)
                    x = Math.floor(Math.random() * 2 + 3);
                else
                    x = 3;
            } else if (z == 1) {
                x = 3;
            } else {
                q = 1;
                x = Math.floor(Math.random() * 2 + 3);
            }
        } else if (currentRow < rows) {
            if (stepHistory[currentColumn][currentRow + 1] == 0) 	// Can go down?
                x = 4;
            else {
                entry = 2;	// Blocked!
                continue;
            }
        } else if (z == 1) {
            entry = 2;	// Blocked!
            continue;
        } else {
            q = 1;
            x = 4;
        }
        if (x == 1) {	// Left
            stepHistory[currentColumn - 1][currentRow] = nextStepCounter;
            nextStepCounter++;
            v[currentColumn - 1][currentRow] = 2;
            currentColumn--;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (x == 2) {	// Up
            stepHistory[currentColumn][currentRow - 1] = nextStepCounter;
            nextStepCounter++;
            v[currentColumn][currentRow - 1] = 1;
            currentRow--;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            q = 0;
            entry = 0;
        } else if (x == 3) {	// Right
            stepHistory[currentColumn + 1][currentRow] = nextStepCounter;
            nextStepCounter++;
            if (v[currentColumn][currentRow] == 0)
                v[currentColumn][currentRow] = 2;
            else
                v[currentColumn][currentRow] = 3;
            currentColumn++;
            if (isExplorationComplete(rows, columns, nextStepCounter)) {
                break;
            }
            entry = 1;
        } else if (x == 4) {	// Down
            if (q != 1) {	// Only if not blocked
                stepHistory[currentColumn][currentRow + 1] = nextStepCounter;
                nextStepCounter++;
                if (v[currentColumn][currentRow] == 0)
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
                if (v[currentColumn][currentRow] == 0) {
                    v[currentColumn][currentRow] = 1;
                    q = 0;
                    currentColumn = 1;
                    currentRow = 1;
                    while (stepHistory[currentColumn][currentRow] == 0) {
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

    printVisitHistory(rows, columns, stepHistory);
}

main();
