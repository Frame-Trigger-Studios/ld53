import {Entity, RenderCircle, Scene} from "lagom-engine";
import {GRID} from "./Grid";
import {Direction} from "honeycomb-grid";
import {Layers} from "../LD53";

enum OrePatchType {
    ZERO,
    ONE
}

const getOrePatch = (type: OrePatchType, x: number, y: number) => {
    let entity: Entity;
    if (type == OrePatchType.ZERO) {
        entity = new OrePatchZero("aaa", x, y, Layers.Ore);
    } else {
        entity = new OrePatchOne("aaa", x, y, Layers.Ore);
    }
    return entity;
};

export class OrePatchZero extends Entity {
    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0xFFFFFF));
    }
}

export class OrePatchOne extends Entity {
    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0xFF00FF));
    }
}

export const worldGen = (scene: Scene) => {
    createOrePatch(scene, OrePatchType.ZERO);
    createOrePatch(scene, OrePatchType.ONE);
};

const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];

const createOrePatch = (scene: Scene, type: OrePatchType) => {

    let patch = randomEntry(GRID.toArray());

    let breakGlass = 20;
    let patches = 4;

    while (breakGlass > 0  && patches > 0) {
        const dir = randomEntry(DIRS);

        const neighbour = GRID.neighborOf(patch, dir, {allowOutside: false});

        if (!neighbour || neighbour.terrain) {
            breakGlass--;
            continue;
        }

        const orePatch = getOrePatch(type, neighbour.x, neighbour.y);
        scene.addEntity(orePatch);
        neighbour.terrain = orePatch;
        patch = neighbour;
        patches--;
    }
};

const randomEntry = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};
