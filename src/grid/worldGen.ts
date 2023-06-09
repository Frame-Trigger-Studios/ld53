import {Component, Entity, RenderCircle, Scene} from "lagom-engine";
import {GRID} from "./Grid";
import {Direction} from "honeycomb-grid";
import {Layers} from "../LD53";
import {MatStorage, MatType} from "../GridObject";


export class MatTypeHolder extends Component
{
    constructor(readonly type: MatType)
    {
        super();
    }
}

export class OrePatchRed extends Entity
{
    onAdded()
    {
        super.onAdded();
        this.addComponent(new MatTypeHolder(MatType.RED));
        this.addComponent(new RenderCircle(0, 0, 10, null, MatType.RED));
    }
}

export class OrePatchBlue extends Entity
{
    onAdded()
    {
        super.onAdded();
        this.addComponent(new MatTypeHolder(MatType.BLUE));
        this.addComponent(new RenderCircle(0, 0, 10, null, MatType.BLUE));
    }
}

export class OrePatchYellow extends Entity
{
    onAdded()
    {
        super.onAdded();
        this.addComponent(new MatTypeHolder(MatType.YELLOW));
        this.addComponent(new RenderCircle(0, 0, 10, null, MatType.YELLOW));
    }
}

const getOrePatch = (type: MatType, x: number, y: number) => {
    let entity: Entity;
    switch (type)
    {
        default:
        case MatType.RED:
            entity = new OrePatchRed(type.toString(), x, y, Layers.Ore);
            break;
        case MatType.BLUE:
            entity = new OrePatchBlue(type.toString(), x, y, Layers.Ore);
            break;
        case MatType.YELLOW:
            entity = new OrePatchYellow(type.toString(), x, y, Layers.Ore);
            break;
    }
    return entity;
};

export const worldGen = (scene: Scene) => {
    createOrePatch(scene, MatType.RED);
    createOrePatch(scene, MatType.BLUE);
    createOrePatch(scene, MatType.YELLOW);

    // put the rocket in the middle
    const entity = scene.addEntity(new MatStorage("rocket", 0, 0, Layers.GridObject));
    GRID.toArray()[0].entity = entity;
};

const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];

const createOrePatch = (scene: Scene, type: MatType) => {

    let patch = randomEntry(GRID.toArray());

    let breakGlass = 40;
    let patches = 4;

    while (breakGlass > 0 && patches > 0)
    {
        const dir = randomEntry(DIRS);

        const neighbour = GRID.neighborOf(patch, dir, {allowOutside: false});

        if (!neighbour || neighbour.terrain)
        {
            breakGlass--;
            continue;
        }

        if (
            GRID.neighborOf(neighbour, Direction.N) == GRID.toArray()[0] ||
            GRID.neighborOf(neighbour, Direction.NE) == GRID.toArray()[0] ||
            GRID.neighborOf(neighbour, Direction.SE) == GRID.toArray()[0] ||
            GRID.neighborOf(neighbour, Direction.S) == GRID.toArray()[0] ||
            GRID.neighborOf(neighbour, Direction.SW) == GRID.toArray()[0] ||
            GRID.neighborOf(neighbour, Direction.NW) == GRID.toArray()[0]) {

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
