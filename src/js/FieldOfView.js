// FieldOfView
//
// Utility module for calculating the visible and seen areas of a given floor
// of the map. This is an octant-based shadow casting algorithm as described here:
//
//   https://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/
//
// In the implementation below, a "Shadow" is represented as a tuple `[start, end]`,
// and a "ShadowLine" is represented as an array of tuples.

import { World } from './World';

export const FieldOfView = {
    resetVisible(visible) {
        for (let y = 0; y < visible.length; y++) {
            for (let x = 0; x < visible[y].length; x++) {
                visible[y][x] = false;
            }
        }
    },

    refreshVisible(origin, visible, seen) {
        for (let i = 0; i < 8; i++) {
            this.refreshOctant(origin, i, visible, seen);
        }
    },

    refreshOctant(origin, octant, visible, seen) {
        const shadowLine = [[]];
        let fullShadow = false;

        // The MAX distance is 16 tiles but rooms should typically be
        // significantly smaller than that.
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col <= row; col++) {
                let pos = this.transformOctant(row, col, octant);
                pos.x += origin.x;
                pos.y += origin.y;
                pos.z = origin.z;

                if (fullShadow) {
                    break;
                } else {
                    let projection = this.projectTile(row, col);
                    let isVisible = !this.shadowLineContains(shadowLine, projection);

                    if (pos.y < 0 || pos.y >= visible.length || pos.x < 0 || pos.x >= visible[pos.y].length) break;

                    if (isVisible) {
                        visible[pos.y][pos.x] = seen[pos.y][pos.x] = true;

                        if (!World.isSeeThrough(pos)) {
                            this.shadowLineMerge(shadowLine, projection);
                            fullShadow = this.shadowLineFull(shadowLine);
                        }
                    }
                }
            }
        }
    },

    transformOctant(row, col, octant) {
        switch (octant) {
            case 0: return { x:  col, y: -row };
            case 1: return { x:  row, y: -col };
            case 2: return { x:  row, y:  col };
            case 3: return { x:  col, y:  row };
            case 4: return { x: -col, y:  row };
            case 5: return { x: -row, y:  col };
            case 6: return { x: -row, y: -col };
            case 7: return { x: -col, y: -row };
        }
    },

    projectTile(row, col) {
        const topLeft = col / (row + 2);
        const bottomRight = (col + 1) / (row + 1);
        return [topLeft, bottomRight];
    },

    shadowContains(a, b) {
        return a[0] <= b[0] && a[1] >= b[1];
    },

    shadowLineContains(shadowLine, shadow) {
        for (const s of shadowLine) {
            if (this.shadowContains(s, shadow)) return true;
        }
        return false;
    },

    shadowLineMerge(shadowLine, shadow) {
        let index = 0;

        for (; index < shadowLine.length; index++) {
            if (shadowLine[index][0] >= shadow[0]) break;
        }

        let overlappingPrevious;
        if (index > 0 && shadowLine[index - 1][1] > shadow[0]) {
            overlappingPrevious = shadowLine[index - 1];
        }

        let overlappingNext;
        if (index < shadowLine.length && shadowLine[index][0] < shadow[1]) {
            overlappingNext = shadowLine[index];
        }

        if (overlappingNext) {
            if (overlappingPrevious) {
                // Overlaps both shadows, unify one and delete the other
                overlappingPrevious[1] = overlappingNext[1];
                shadowLine.splice(index, 1);
            } else {
                // Overlaps next shadow, unify with that one
                overlappingNext[0] = shadow[0];
            }
        } else {
            if (overlappingPrevious) {
                // Overlaps previous shadow, unify with that one
                overlappingPrevious[1] = shadow[1];
            } else {
                shadowLine.splice(index, 0, shadow);
            }
        }
    },

    shadowLineFull(shadowLine) {
        return shadowLine.length === 1 && shadowLine[0][0] === 0 && shadowLine[0][1] === 1;
    }
};
