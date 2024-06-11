class GameLoop {
    constructor(herosMap) {
        this.herosOnline = herosMap; 
        this.connectionSet = new Set();
        this.loop = null;
        //this.publishToClients = this.publishToClients.bind(this);
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
        //get collection of online characters
        /* let herosOnline = null;

        try {
            const onlineResults = await pool.query(gameQuery.getOnlineHeros);
            herosOnline = onlineResults.rows;

        } catch (error) {
            console.log("Error retrieving online characters, ", error);
        } */
        // iterate through the connections and configure a custom payload
        this.connectionSet.forEach(ws => {
            //const user = ws.user;
            const myHero = ws.hero;
            //retrieve and organize data
            //const myHero = herosOnline.find(hero => hero.player_id == user.id);
            const herosOnline = Array.from(this.herosOnline.values());
            const otherHeros = herosOnline.filter(hero => hero.id !== myHero.id);
            const message = {
                type: "update",
                playersOnline: herosOnline,
                otherHeros: otherHeros,
                myHero: myHero,
            };
            ws.send(JSON.stringify(message));
            //send data
        });
    }
}
module.exports = GameLoop;