const gameEngine = {

    processDirection: async (hero, directionVector) => {
        let moveSpeed = 2;
        const { directionX, directionY } = directionVector;
        
        if (directionX && directionY) {
            moveSpeed *= 0.707;
        }
        if (directionX === "a") {
            hero.position_x -= moveSpeed;
            hero.direction_facing = "left";
        } else if (directionX === "d") {
            hero.position_x += moveSpeed;
            hero.direction_facing = "right";
        }

        if (directionY === "w") {
            hero.position_y -= moveSpeed;
        } else if (directionY === "s") {
            hero.position_y += moveSpeed;
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
