import {Component, Entity, Log, MathUtil, RenderCircle, System, Timer} from "lagom-engine";
import {CustomHex} from "./grid/Grid";
import {Belt, BeltSpeed, InputBuffer, OutputBuffer} from "./tiles/Belt";
import {Layers} from "./LD53";
import {ResourceCount} from "./Inventory";
import {MatTypeHolder} from "./grid/worldGen";

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
    constructor(readonly hex: CustomHex, readonly type: MatType)
    {
        super("ass", hex.x, hex.y, Layers.GridObject);
        this.stored.set(MatType.RED, 0);
        this.stored.set(MatType.GREEN, 0);
        this.stored.set(MatType.BLUE, 0);
        this.stored.set(MatType.YELLOW, 0);
        this.stored.set(MatType.ORANGE, 0);
        this.stored.set(MatType.PURPLE, 0);
    }

    stored: Map<MatType, number> = new Map<MatType, number>();

    onAdded()
    {
        super.onAdded();
        this.addComponent(new AllowInput());
        this.addComponent(new RenderCircle(0, 0, 8, 0x0, this.type));
        this.componentAddedEvent.register((caller, data) => {
            if (data instanceof MatTypeHolder)
            {
                this.stored.set(data.type, this.stored.get(data.type) as number + 1);
            }
        });

        this.addComponent(new Timer(2000, null, true)).onTrigger.register((caller) => {

            const yellow = this.stored.get(MatType.YELLOW) ?? 0;
            const red = this.stored.get(MatType.RED) ?? 0;
            const blue = this.stored.get(MatType.BLUE) ?? 0;

            // check if we can make our output
            switch (this.type)
            {
                case MatType.ORANGE:
                    if (yellow > 0 && red > 0)
                    {
                        this.stored.set(MatType.YELLOW, yellow - 1);
                        this.stored.set(MatType.RED, red - 1);
                        this.scene.addEntity(new Mat(this.transform.x, this.transform.y, this.type, this.hex.dest));
                    }
                    break;
                case MatType.PURPLE:
                    if (red > 0 && blue > 0)
                    {
                        this.stored.set(MatType.BLUE, blue - 1);
                        this.stored.set(MatType.RED, red - 1);
                        this.scene.addEntity(new Mat(this.transform.x, this.transform.y, this.type, this.hex.dest));

                    }
                    break;
                case MatType.GREEN:
                    if (yellow > 0 && blue > 0)
                    {
                        this.stored.set(MatType.YELLOW, yellow - 1);
                        this.stored.set(MatType.BLUE, blue - 1);
                        this.scene.addEntity(new Mat(this.transform.x, this.transform.y, this.type, this.hex.dest));
                    }
                    break;
            }
        });
    }
}


export class Miner extends Entity
{
    constructor(readonly hex: CustomHex, readonly type: MatType)
    {
        super("miner", hex.x, hex.y, Layers.GridObject);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, this.type));
        this.addComponent(new InputBuffer(100, 100));
        this.addComponent(new OutputBuffer(1, 0));
        this.addComponent(new BeltSpeed(1));
        this.addComponent(new Timer(2000, null, true)).onTrigger.register((caller) => {
            this.scene.addEntity(new Mat(this.transform.x, this.transform.y, this.type, this.hex.dest));
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
                }
                else if (moveMe.dest.entity instanceof Belt)
                {
                    // Pick the next destination
                    moveMe.x = moveMe.dest.x;
                    moveMe.y = moveMe.dest.y;
                    moveMe.dest = moveMe.dest.dest;
                }
                else if (moveMe.dest.entity instanceof Assembler)
                {
                    moveMe.dest.entity.addComponent(new MatTypeHolder((entity as Mat).colour));
                    entity.destroy();
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
    YELLOW = 0xFFFF00,
    PURPLE = 0x660099,
    ORANGE = 0xff9900,
    GREEN = 0x00cc00

}

export class Mat extends Entity
{
    constructor(x: number, y: number, readonly colour: MatType, readonly initialDest: CustomHex | null)
    {
        super(colour.toString(), x, y, Layers.Item);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new MoveMe(this.transform.x, this.transform.y, this.initialDest));
        this.addComponent(new RenderCircle(0, 0, 4, this.colour, 0x000000));
    }
}
