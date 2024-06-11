const getHeroById = `
    SELECT *
    FROM heros
    WHERE player_id = $1
`;
const addHero = `
    INSERT INTO heros (player_id)
    VALUES ($1)
`;
const getOnlineHeros = `
    SELECT * 
    FROM heros
    WHERE isOnline = TRUE
`;
const setOnline = `
    UPDATE heros
    SET isOnline = TRUE
    WHERE player_id = $1
`;
const setOffline = `
    UPDATE heros
    SET isOnline = FALSE
    WHERE player_id = $1
`;
const getCurrentActionById = `
    SELECT current_action
    FROM heros
    WHERE player_id = $1
`;
const setActionById = `
    UPDATE heros
    SET current_action = $1
    WHERE player_id = $2
`;
const setBowChargeById = `
    UPDATE heros
    SET 
        charge_lvl = $2,
        charge_pct = $3
    WHERE player_id = $1
        
`;
const releaseBowById = `
    UPDATE heros
    SET
        charge_lvl = 0,
        charge_pct = 0,
        current_action = 'idle'
    WHERE player_id = $1
`;
const setDirectionAimingById = `
    UPDATE heros
    SET direction_aiming = $2
    WHERE player_id = $1
`;

module.exports = {
    getHeroById,
    addHero,
    getOnlineHeros,
    setOnline,
    setOffline,
    getCurrentActionById,
    setActionById,
    setBowChargeById,
    releaseBowById,
    setDirectionAimingById,
}