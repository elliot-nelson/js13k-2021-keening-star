// CombatSystem

export const CombatSystem = {
    WHIFF: 1,
    HIT: 2,
    CRIT: 3,

    CRIT_MULTIPLIER: 1.5,

    rollAttack(attackStat, weaponDamage) {
        // Stat = 1        78% whiff
        // Stat = 8        33% whiff
        // Stat = 12       21% whiff
        // Stat = 20        8% whiff
        // Stat = 40       <1% whiff
        let hitChance = 0.88 * 0.7 ** (attackStat / 3);

        // Stat = 1        <1% crit
        // Stat = 8         5% crit
        // Stat = 12        7% crit
        // Stat = 20       12% crit
        // Stat = 40       23% crit
        let critChance = 0.98 ** (attackStat / 3);

        // Weapon damage is just a multiplier on attack stat. This makes math a lot easier
        // when crafting enemies in particular... for example, high Vigor + low weapon =
        // enemy that never misses but only scratches you, whereas low Vigor + high weapon =
        // enemy that can miss but hits hard.
        let baseDamage = weaponDamage * attackStat;

        let roll = Math.random();

        if (roll < hitChance) {
            return { result: CombatSystem.WHIFF, value: 0 };
        } else if (roll > critChance) {
            return { reuslt: CombatSystem.CRIT, value: Math.floor(baseDamage * CombatSystem.CRIT_MULTIPLIER) };
        } else {
            return { result: CombatSystem.HIT, value: Math.floor(baseDamage) };
        }
    },

    formatActorName(entity) {
        let n = entity.actorName.charCodeAt(0);
        if (n >= 97 && n <= 122) {
            return 'A ' + entity.actorName;
        } else {
            return entity.actorName;
        }
    },

    formatActeeName(entity) {
        let n = entity.actorName.charCodeAt(0);
        if (n >= 97 && n <= 122) {
            return 'the ' + entity.actorName;
        } else {
            return entity.actorName;
        }
    }
}
