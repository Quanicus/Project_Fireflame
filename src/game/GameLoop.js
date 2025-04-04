class GameLoop {
    constructor(heroesMap, projectiles) {
        this.heroesOnline = heroesMap; 
        this.projectiles = projectiles;
        this.connectionSet = new Set();
        this.loop = null;
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
    updateProjectilePosition() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.position_x += projectile.velocity_x;
            projectile.position_y += projectile.velocity_y;

            this.heroesOnline.forEach(hero => {
                if (projectile.owner === hero.player_id) return;
                const hitbox_x = { min: hero.position_x - 20, max: hero.position_x + 20 };
                const hitbox_y = { min: hero.position_y - 20, max: hero.position_y + 20 };
                if (projectile.position_x >= hitbox_x.min && projectile.position_x <= hitbox_x.max &&
                    projectile.position_y >= hitbox_y.min && projectile.position_y <= hitbox_y.max) {
                    hero.current_hp--;
                    projectile.flight_time = 50;
                    if (hero.current_hp <= 0) {
                        //dead
                    }
                }
            });
            if (projectile.flight_time >= 50) {
                this.projectiles.splice(i, 1);
            }
        }
        this.projectiles.forEach(projectile => projectile.flight_time += 1);
    }
    async publishToClients() {
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
                projectiles: this.projectiles
            };
            ws.send(JSON.stringify(message));
        });
    }
}
module.exports = GameLoop;
