// TurnSystem

import { Game } from './Game';

export const TurnSystem = {
    takeEntityTurns() {
        const entities = [...Game.entities];

        if (!Game.player.tp) Game.player.tp = 0;

        if (Game.player.tp >= Game.player.speed) {
            // All entities are "paused" until the player takes a turn.
            let turnTaken = Game.player.update();

            if (turnTaken) {
                Game.player.tp -= Game.player.speed;
            }

            // Entities with no speed are frame-based instead of turn-based. (For
            // example, most spawned particles, which are also entities.)
            /*for (let entity of entities) {
                if (!entity.speed) entity.update();
            }*/
        } else {
            for (let entity of entities) {
                entity.tp = (entity.tp || 0) + 1;

                /*while (entity.tp >= entity.speed && entity !== Game.player) {
                    entity.update();
                    entity.tp -= entity.speed;
                }*/
            }
        }

        //console.log(Game.entities.map(x => x.tp));
    }
};
