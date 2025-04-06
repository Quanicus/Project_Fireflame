const wallMatrix = require("./generateWalls.js");
const gameEngine = {

    processDirection: async (hero, directionVector) => {
        const { directionX, directionY } = directionVector;
        const currentTileX = Math.floor((hero.position_x + 10) / 40);
        const currentTileY = Math.floor((hero.position_y + 20) / 40);
        let moveSpeed = hero.move_speed ?? 2;
        if (directionX && directionY) {
            moveSpeed *= 0.707;
        }

        let newPositionX = 0;
        if (directionX === "W") {
            hero.direction_facing = "left";
            newPositionX = hero.position_x - moveSpeed;
            const newTileX = Math.floor((newPositionX + 10) / 40);
            if ((currentTileX !== newTileX && !wallMatrix[newTileX][currentTileY].includes('E')) ||
                (currentTileX === newTileX)) {
                hero.position_x = newPositionX;
            }
        } else if (directionX === "E") {
            hero.direction_facing = "right";
            newPositionX = hero.position_x + moveSpeed;
            const newTileX = Math.floor(((newPositionX - 10) + 40) / 40);

            if ((currentTileX !== newTileX && !wallMatrix[newTileX][currentTileY].includes('W')) ||
                (currentTileX === newTileX)) {
                hero.position_x = newPositionX;
            }
        }

        let newPositionY = 0;
        if (directionY === "N") {
            newPositionY = hero.position_y - moveSpeed;
            const newTileY = Math.floor((newPositionY + 20) / 40);

            if ((currentTileY !== newTileY && !wallMatrix[currentTileX][newTileY].includes('S')) ||
                (currentTileY === newTileY)) {
                hero.position_y = newPositionY;
            }
        } else if (directionY === "S") {
            newPositionY = hero.position_y + moveSpeed;
            const newTileY = Math.floor((newPositionY + 40) / 40);
            if ((currentTileY !== newTileY && !wallMatrix[currentTileX][newTileY].includes('N')) ||
                (currentTileY === newTileY)) {
                hero.position_y = newPositionY;
            }
        }


        if (hero.current_action !== "chargingBow") {
            hero.current_action = "running";
        }
    },
    processChargeStart: async (hero, clickData) => {
        const {x, y, displayWidth: width, displayHeight: height} = clickData;
        const center = { x: width/2, y: height/2 };
        const relativeX = x - center.x; 
        const relativeY = center.y - y;
        const angle = Math.atan2(relativeY, relativeX) * (180/Math.PI);
        
        let direction;
        if (angle > -157.5 && angle < -112.5) {
            direction = "NE";
        } else if (angle >= -112.5 && angle <= -67.5) {
            direction = "N";
        } else if (angle > -67.5 && angle < -22.5) {
            direction = "NW";
        } else if (angle >= -22.5 && angle <= 22.5) {
            direction = "W";
        } else if (angle > 22.5 && angle < 67.5) {
            direction = "SW";
        } else if (angle >= 67.5 && angle <= 112.5) {
            direction = "S";
        } else if (angle > 112.5 && angle < 157.5) {
            direction = "SE";
        } else {
            direction = "E";
        }
        hero.current_action = "chargingBow";
        hero.direction_aiming = direction;
    },
    processBowCharge: async (hero) => {
        if (hero.charge_lvl >= 5) return;

        hero.charge_pct += 50;
        if (hero.charge_pct >= 100) {
            hero.charge_pct = 0;
            hero.charge_lvl++;
        }
    },
    processBowRelease: (hero, clickData) => {
        const {x, y, displayWidth: width, displayHeight: height} = clickData;
        const center = { x: width/2, y: height/2 };
        const relativeX = x - center.x; 
        const relativeY = center.y - y;
        const angle_degrees = Math.atan2(relativeY, relativeX) * (180/Math.PI);
        
        let aimAngle;
        if (angle_degrees <= 0) {
            aimAngle = angle_degrees + 180;
        } else {
            aimAngle = angle_degrees - 180;
        }
        const angle_radians = -aimAngle / (180/Math.PI);
        const direction = hero.direction_aiming;
        if (direction === "W" || direction === "NW" || direction === "SW") {
            hero.direction_facing = "left";
        }
        
        let projectile = null;
        if (hero.charge_lvl === 5) {
            projectile = {
                position_x: hero.position_x,
                position_y: hero.position_y,
                velocity_x: 10 * Math.cos(angle_radians),
                velocity_y: 10 * Math.sin(angle_radians),
                shot_angle: angle_radians,
                flight_time: 0,
                owner: hero.player_id
            };
        }
        hero.charge_lvl = 0;
        hero.current_action = "idle";
        hero.direction_aiming = null;

        return projectile;
    },
    processAimBow: async (hero, clickData) => {
        const {x, y, displayWidth: width, displayHeight: height} = clickData;
        const center = { x: width/2, y: height/2 };
        const relativeX = x - center.x; 
        const relativeY = center.y - y;
        const angle = Math.atan2(relativeY, relativeX) * (180/Math.PI);
        let direction;
        if (angle > -157.5 && angle < -112.5) {
            direction = "NE";
        } else if (angle >= -112.5 && angle <= -67.5) {
            direction = "N";
        } else if (angle > -67.5 && angle < -22.5) {
            direction = "NW";
        } else if (angle >= -22.5 && angle <= 22.5) {
            direction = "W";
        } else if (angle > 22.5 && angle < 67.5) {
            direction = "SW";
        } else if (angle >= 67.5 && angle <= 112.5) {
            direction = "S";
        } else if (angle > 112.5 && angle < 157.5) {
            direction = "SE";
        } else {
            direction = "E";
        }
        hero.direction_aiming = direction;
    }, 
}
module.exports = gameEngine;
