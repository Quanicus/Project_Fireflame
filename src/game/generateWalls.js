const rows = 30;
const cols = 40;
const wallMatrix = [];

for (let x = 0; x <= cols; x++) {
    wallMatrix[x] = [];
    for (let y = 0; y <= rows; y++) {
        if (x < 1 || x > cols - 1 || y < 1 || y > rows - 1) {
            wallMatrix[x][y] = ['N','S','E','W'];
        } else if (x === 2 && y <= rows - 12) {//left wall
            wallMatrix[x][y] = ['W'];
            wallMatrix[x-1][y] = ['E'];
        } else if (x === cols - 1 && y <= rows - 4) {//right wall
            wallMatrix[x][y] = ['W'];
            wallMatrix[x-1][y] = ['E'];
        } else if (x === cols - 19 && y >= rows - 10 && y <= rows - 4) {//middle right wall
            wallMatrix[x][y] = ['W'];
            wallMatrix[x-1][y] = ['E'];
        } else {
            wallMatrix[x][y] = [];
        }
    }
}
//bottom left wall
for (let x = 2; x <= 13; x++) {
    wallMatrix[x][rows-11] = ['N','S','E','W'];
}
//bottom right wall
for (let x = cols - 2; x >= cols - 19; x--) {
    wallMatrix[x][rows-3] = ['N','S','E','W'];
}

module.exports = wallMatrix;
