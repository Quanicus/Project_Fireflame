class GameLoop {
    constructor(herosMap) {
        this.herosOnline = herosMap; 
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
    async publishToClients() {
        this.connectionSet.forEach(ws => {
            const myHero = ws.hero;
            const herosOnline = Array.from(this.herosOnline.values());
            const otherHeros = herosOnline.filter(hero => hero.id !== myHero.id);
            const message = {
                type: "update",
                playersOnline: herosOnline,
                otherHeros: otherHeros,
                myHero: myHero,
            };
            ws.send(JSON.stringify(message));
        });
    }
}
module.exports = GameLoop;