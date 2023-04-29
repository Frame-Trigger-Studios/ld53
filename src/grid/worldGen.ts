import {Entity, RenderCircle, Scene} from "lagom-engine";
import {GRID} from "./Grid";
import {Direction} from "honeycomb-grid";
import {Point} from "pixi.js";

enum OrePatchType {
    ZERO,
    ONE
}

const getOrePatch = (type: OrePatchType, x: number, y: number) => {
    let entity: Entity;
    if (type == OrePatchType.ZERO) {
        entity = new OrePatchZero("aaa", x, y);
    } else {
        entity = new OrePatchOne("aaa", x, y);
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

const createOrePatch = (scene: Scene, type: OrePatchType) => {

    const patch = randomEntry(GRID.toArray());

    const entity = getOrePatch(type, patch.x, patch.y);
    scene.addEntity(entity);
    patch.entity = entity;

    const dirs = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];

    for (let i = 0; i < 3; i++) {
        const dir = randomEntry(dirs);
        const neighbour = GRID.neighborOf(patch, dir, {allowOutside: false});

        if (!neighbour || neighbour.entity) continue;

        const entity = getOrePatch(type, neighbour.x, neighbour.y);
        scene.addEntity(entity);
        neighbour.entity = entity;
    }
};

const randomEntry = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};