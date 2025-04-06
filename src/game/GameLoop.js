const gameEngine = require("./GameEngine");

class GameLoop {
    constructor(heroesMap, projectiles) {
        this.heroesOnline = heroesMap; 
        this.goblins = new Map();
        this.goblinId = 0;
        this.projectiles = projectiles;
        this.connectionSet = new Set();
        this.loop = null;

        const directionMap = new Map();
        directionMap.set(0, {directionX: 'W'});
        directionMap.set(1, {directionX: 'E'});
        directionMap.set(2, {directionY: 'N'});
        directionMap.set(3, {directionY: 'S'});
        directionMap.set(4, {directionX: 'W', directionY: 'S'});
        directionMap.set(5, {directionX: 'W', directionY: 'N'});
        directionMap.set(6, {directionX: 'E', directionY: 'S'});
        directionMap.set(7, {directionX: 'E', directionY: 'N'});

        this.directionMap = directionMap;
        console.log("game loop created");
    }
    start() {
        console.log("starting loop")
        this.loop = setInterval(this.publishToClients.bind(this), 1000/60); //loop at /60 fps
    }
    stop() {
        clearInterval(this.loop);
    }
    addConnection(connection) {
        this.connectionSet.add(connection);
        if (this.connectionSet.size === 1) {
            this.start();
        }
        console.log("connection added to loop");
    }
    removeConnection(connection) {
        this.connectionSet.delete(connection);
        if(this.connectionSet.size === 0) {
            this.stop();
        }
    }
    spawnGoblins() {
        while (this.goblins.size < 10) {
            const goblin = {
                id: this.goblinId++,
                position_x: (Math.floor(Math.random() * 11) + 20) * 40,
                position_y: (Math.floor(Math.random() * 11) + 10) * 40,
                direction_facing: "right",
                max_hp: 10,
                current_hp: 10,
                move_speed: 2,
                current_action: "idle",
                direction_vector: null,
                action_counter: 0
            };
            this.goblins.set(goblin.id, goblin);
        }
    }
    updateGoblins() {
        this.goblins.forEach(goblin => {
            goblin.action_counter += 1;
            if (goblin.action_counter >= 100) {
                goblin.action_counter = 0;
                const running = Math.floor(Math.random() * 4);
                if (!running) {
                    goblin.current_action = "idle";
                } else {
                    const directionKey = Math.floor(Math.random() * 8);
                    goblin.direction_vector = this.directionMap.get(directionKey);
                    goblin.current_action = "running";
                }
            }
            if (goblin.current_action === "running") {
                gameEngine.processDirection(goblin, goblin.direction_vector);
            }
        });
    }
    updateProjectilePosition() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.position_x += projectile.velocity_x;
            projectile.position_y += projectile.velocity_y;

            this.heroesOnline.forEach(hero => {
                if (projectile.owner === hero.player_id) return;
                this.checkCollision(projectile, hero);
                if (hero.current_hp <= 0) {
                    //dead
                }
            });

            for (const [id, goblin] of this.goblins) {
                this.checkCollision(projectile, goblin);
                if (goblin.current_hp <= 0) {
                    this.goblins.delete(id);
                }
            }
            if (projectile.flight_time >= 50) {
                this.projectiles.splice(i, 1);
            }
        }
        this.projectiles.forEach(projectile => projectile.flight_time += 1);
    }
    checkCollision(projectile, enemy) {
        const hitbox_x = { min: enemy.position_x - 20, max: enemy.position_x + 20 };
        const hitbox_y = { min: enemy.position_y - 20, max: enemy.position_y + 20 };
        if (projectile.position_x >= hitbox_x.min && projectile.position_x <= hitbox_x.max &&
            projectile.position_y >= hitbox_y.min && projectile.position_y <= hitbox_y.max &&
            enemy.current_hp > 0) {
        
            enemy.current_hp--;
            projectile.flight_time = 50;
        }
    }
    async publishToClients() {
        //this.spawnGoblins();
        //this.updateGoblins();
        if (this.projectiles.length > 0) this.updateProjectilePosition();
        this.connectionSet.forEach(ws => {
            const myHero = ws.hero;
            const heroesOnline = Array.from(this.heroesOnline.values());
            const otherHeroes = heroesOnline.filter(hero => hero.id !== myHero.id);
            const message = {
                type: "update",
                playersOnline: heroesOnline,
                otherHeroes: otherHeroes,
                myHero: myHero,
                projectiles: this.projectiles,
                goblins: [...this.goblins.values()]
            };
            ws.send(JSON.stringify(message));
        });
    }
}
module.exports = GameLoop;
