require('dotenv').config();
const jwt = require("jsonwebtoken");
const gameQuery = require("./src/api/game/queries");
const GameLoop = require("./src/game/GameLoop");
const gameEngine = require("./src/game/GameEngine");
const {Pool} = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
    /* user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 */
})

const herosOnline = new Map();
const gameLoop = new GameLoop(herosOnline);
const decoder = new TextDecoder('utf-8');

const wsServer = require("uWebSockets.js").App().ws("/*", {
    upgrade: async (res, req, context) => {
        
        req.forEach(header => console.log(header));
        console.log("origin", req.getHeader("origin"));
        console.log("url", req.getUrl());
        console.log(req.getQuery("game-key"));
        const cookieHeader = req.getHeader("cookie");
        if (!cookieHeader) {
            console.error("Cookies not found");
            return res.writeStatus('401').end();
        }
        //get a dictionary of cookies
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split("=");
            acc[name] = value;
            return acc;
        }, {});
        
        const accessToken = cookies["accessToken"];
        if (!accessToken) {
            console.error("JWT token not found in cookie");
            return res.writeStatus('401').end();
        }

        let user = {};
        try { //save decoded user info
            user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            console.log("JWT verification failed:", error);
            return res.writeStatus('401').end();
        }

        res.upgrade( // upgrade to websocket
            { // 1st argument sets which properties to pass to ws object, in this case ip address
                user: user,
                lastMessageTimestamp: 0, 
                lastChargeTimestamp: 0,
                lastAimTimestamp: 0,
            }, 
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'), // 3 headers are used to setup websocket
            context // also used to setup websocket
        )
    },
    open: async (ws) => {
        const user = ws.user;
        console.log(`User ${user.id} has connected`)
        //GET CHARDATA
        try {
            await pool.query(gameQuery.addHero, [user.id]);

        } catch (error) {
            if (error.code == 23505) {
                console.log("welcome returning player");
                await pool.query(gameQuery.setOnline, [user.id])
            }   
        }
        //use user_id to get character data
        try {
            const result = await pool.query(gameQuery.getHeroById,[user.id]);
            ws.hero = result.rows[0];
            herosOnline.set(user.id, ws.hero);
        } catch (error) {
            console.error("problem fetching player hero", error);
        }
 
        ws.subscribe("chat");
        gameLoop.addConnection(ws);
    },
    message: (ws, message, isBinary) => {
        //calculate movement and update db entries
        const user = ws.user;
        const hero = ws.hero;

        const text = decoder.decode(message);
        const msgObj = JSON.parse(text);
        const currentTimestamp = Date.now();

        switch (msgObj.type) {
            case "chat":
                msgObj.name = user.hero.name;
                console.log(msgObj);
                wsServer.publish("chat", JSON.stringify(msgObj));
                break;
            case "direction":
                /* if (currentTimestamp - ws.lastMessageTimestamp < 60) {return;}
                ws.lastMessageTimestamp = currentTimestamp; */
                //gameEngine.processDirection(ws.user.id, msgObj.payload);
                gameEngine.processDirection(hero, msgObj.payload);
                break;
            case "idle":
                if (hero.current_action !== "chargingBow"){
                    hero.current_action = "idle";
                }
                
                break;
            case "startCharge":
                gameEngine.processChargeStart(hero, msgObj.payload);
                break;
            case "chargeBow":
                if (currentTimestamp - ws.lastChargeTimestamp < 60) {return;}
                ws.lastChargeTimestamp = currentTimestamp;

                gameEngine.processBowCharge(hero, msgObj.payload);
                break;
            case "aimBow":
                if (currentTimestamp - ws.lastAimTimestamp < 10) {return;}
                ws.lastAimTimestamp = currentTimestamp;

                gameEngine.processAimBow(hero, msgObj.payload);
                break;
            case "releaseBow":
                gameEngine.processBowRelease(hero, msgObj.payload);
                break;
            default:
                console.log("default", msgObj.content);
        }
    },
    close: async (ws, code, message) => {
        const user = ws.user;
        herosOnline.delete(user.id);
        gameLoop.removeConnection(ws);//remove connection from the game loop
        await pool.query(gameQuery.setOffline, [user.id]);
        console.log(`User ${user.id} has disconnected`);
    },
});

const PORT = process.env.PORT || 9001;
wsServer.listen("0.0.0.0", PORT, (token) => {
    if (token) {
        console.log(`WebSocket server listening on port ${PORT}`);
    } else {
        console.log("uWebSocket failed to listen on port", PORT);
    }
    
});