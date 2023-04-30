import {Component, Entity, MathUtil, RenderCircle, System, Timer} from "lagom-engine";
import {CustomHex} from "./grid/Grid";
import {Belt, BeltSpeed, InputBuffer, OutputBuffer} from "./tiles/Belt";
import {Layers} from "./LD53";
import {ResourceCount} from "./Inventory";

export class AllowInput extends Component
{
}

export class GridObject extends Component
{
    constructor(readonly x: number, readonly y: number, readonly z: number)
    {
        super();
    }
}

export class HexReference extends Component
{
    constructor(readonly hex: CustomHex)
    {
        super();
    }
}

// this is the rocket
export class MatStorage extends Entity
{
    onAdded()
    {
        super.onAdded();
        this.addComponent(new AllowInput());
        this.addComponent(new RenderCircle(0, 0, 10, 0xFF0000));
        // this.addComponent(new Sprite(this.scene.game.getResource("orange").textureFromIndex(0), {xOffset: -16,
        // yOffset: -16}));
    }
}

export class Assembler extends Entity
{
    onAdded()
    {
        super.onAdded();
        this.addComponent(new AllowInput());
        this.addComponent(new RenderCircle(0, 0, 10, 0x0000FF));
    }
}


export class Miner extends Entity
{
    constructor(readonly hex: CustomHex)
    {
        super("miner", hex.x, hex.y, Layers.GridObject);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0x00FF00));
        this.addComponent(new InputBuffer(100, 100));
        this.addComponent(new OutputBuffer(1, 0));
        this.addComponent(new BeltSpeed(1));
        this.addComponent(new Timer(2000, null, true)).onTrigger.register((caller) => {
            this.scene.addEntity(new Mat(this.transform.x, this.transform.y, MatType.PURPLE, this.hex.dest));
        });
    }
}

export class MatMover extends System<[MoveMe]>
{
    types = () => [MoveMe];

    update(delta: number)
    {
        this.runOnEntities((entity, moveMe) => {
            // Translate towards destination.
            if (moveMe.dest == null)
            {
                entity.destroy();
                return;
            }

            if (MathUtil.pointDistance(entity.transform.x, entity.transform.y, moveMe.dest.x, moveMe.dest.y) < 1)
            {
                if (moveMe.dest.entity instanceof MatStorage)
                {
                    // consume it
                    this.scene.getEntityWithName("inv")?.getComponent<ResourceCount>(ResourceCount)?.addMat(entity);
                } else if (moveMe.dest.entity instanceof Belt)
                {
                    // Pick the next destination
                    moveMe.x = moveMe.dest.x;
                    moveMe.y = moveMe.dest.y;
                    moveMe.dest = moveMe.dest.dest;
                }
            }

            if (moveMe.dest == null)
            {
                entity.destroy();
                return;
            }

            const xMove = moveMe.dest.x - moveMe.x;
            const yMove = moveMe.dest.y - moveMe.y;
            entity.transform.x += xMove * (0.4 * (delta / 1000));
            entity.transform.y += yMove * (0.4 * (delta / 1000));
        });
    }
}

class MoveMe extends Component
{
    constructor(public x: number, public y: number, public dest: CustomHex | null)
    {
        super();
    }
}

export enum MatType
{
    RED = 0xFF0000,
    BLUE = 0x0033CC,
    YELLOW = 0xFFFF0,
    PURPLE = 0x660099,
    ORANGE = 0xff9900,
    GREEN = 0x00cc00

}

export class Mat extends Entity
{
    constructor(x: number, y: number, readonly colour: MatType, readonly initialDest: CustomHex | null)
    {
        super("mat1", x, y, Layers.Item);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new MoveMe(this.transform.x, this.transform.y, this.initialDest));
        this.addComponent(new RenderCircle(0, 0, 4, this.colour, 0x000000));
    }
}
