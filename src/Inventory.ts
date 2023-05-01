import {Component, Entity, RenderCircle, System, TextDisp} from "lagom-engine";
import {Mat, MatType} from "./GridObject";


// export const COSTS = {
//     "red-miner": [(MatType.RED, 1)],
//     "blue-miner": [(MatType.RED, 1)],
//     "yellow-miner": [(MatType.PURPLE, 1)],
//     "purple-assembler": [(MatType.RED, 1), (MatType.BLUE, 1)],
//     "orange-assembler": [(MatType.YELLOW, 1)],
//     "green-assembler": [(MatType.PURPLE, 1), (MatType.ORANGE, 1)],
// };

export class ResourceCount extends Component
{
    constructor(public red: number,
                public blue: number,
                public yellow: number,
                public purple: number,
                public orange: number,
                public green: number)
    {
        super();
    }

    addMat(entity: Entity)
    {
        switch((entity as Mat).colour) {
            case MatType.RED:
                this.red++;
                break;
            case MatType.BLUE:
                this.blue++;
                break;
            case MatType.YELLOW:
                this.yellow++;
                break;
            case MatType.PURPLE:
                this.purple++;
                break;
            case MatType.ORANGE:
                this.orange++;
                break;
            case MatType.GREEN:
                this.green++;
                break;
        }

        entity.destroy();
    }

    getCount(colour: MatType): number
    {
        switch (colour) {
            case MatType.RED:
                return this.red;
            case MatType.BLUE:
                return this.blue;
            case MatType.YELLOW:
                return this.yellow;
            case MatType.PURPLE:
                return this.purple;
            case MatType.ORANGE:
                return this.orange;
            case MatType.GREEN:
                return this.green;

        }
        return 0;
    }
}

export class RenderInventory extends System<[ResourceCount, TextDisp]>
{
    types = () => [ResourceCount, TextDisp];

    update(delta: number): void
    {
        this.runOnEntities((entity, count, disp) => {
            disp.pixiObj.text = `${count.red}\n${count.blue}\n${count.yellow}\n${count.purple}\n${count.orange}\n${count.green}`;
        });
    }
}

export class Inventory extends Entity
{
    constructor()
    {
        super("inv", 5, 200);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new ResourceCount(5, 0, 0, 0, 0, 0));
        this.addComponent(new TextDisp(10, -7, "", {fontSize: 10, fill: "white"}));
        this.addComponent(new RenderCircle(0, 0, 3, MatType.RED, MatType.RED));
        this.addComponent(new RenderCircle(0, 12, 3, MatType.BLUE, MatType.BLUE));
        this.addComponent(new RenderCircle(0, 24, 3, MatType.YELLOW, MatType.YELLOW));
        this.addComponent(new RenderCircle(0, 36, 3, MatType.PURPLE, MatType.PURPLE));
        this.addComponent(new RenderCircle(0, 48, 3, MatType.GREEN, MatType.GREEN));
        this.addComponent(new RenderCircle(0, 60, 3, MatType.ORANGE, MatType.ORANGE));


        this.scene.addSystem(new RenderInventory());
    }
}
