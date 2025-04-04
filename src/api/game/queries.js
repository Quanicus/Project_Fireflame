const getHeroById = `
    SELECT *
    FROM heroes
    WHERE player_id = $1
`;
const addHero = `
    INSERT INTO heroes (player_id)
    VALUES ($1)
`;
const getOnlineHeroes = `
    SELECT * 
    FROM heroes
    WHERE isOnline = TRUE
`;
const setOnline = `
    UPDATE heroes
    SET isOnline = TRUE
    WHERE player_id = $1
`;
const setOffline = `
    UPDATE heroes
    SET isOnline = FALSE
    WHERE player_id = $1
`;
const getCurrentActionById = `
    SELECT current_action
    FROM heroes
    WHERE player_id = $1
`;
const setActionById = `
    UPDATE heroes
    SET current_action = $1
    WHERE player_id = $2
`;
const setBowChargeById = `
    UPDATE heroes
    SET 
        charge_lvl = $2,
        charge_pct = $3
    WHERE player_id = $1
        
`;
const releaseBowById = `
    UPDATE heroes
    SET
        charge_lvl = 0,
        charge_pct = 0,
        current_action = 'idle'
    WHERE player_id = $1
`;
const setDirectionAimingById = `
    UPDATE heroes
    SET direction_aiming = $2
    WHERE player_id = $1
`;

module.exports = {
    getHeroById,
    addHero,
    getOnlineHeroes,
    setOnline,
    setOffline,
    getCurrentActionById,
    setActionById,
    setBowChargeById,
    releaseBowById,
    setDirectionAimingById,
}
