import {Component, Entity, System, TextDisp} from "lagom-engine";
import {MatType} from "./GridObject";


export const COSTS = {
    "red-miner": [(MatType.RED, 1)],
    "blue-miner": [(MatType.RED, 1)],
    "yellow-miner": [(MatType.PURPLE, 1)],
    "purple-assembler": [(MatType.RED, 1), (MatType.BLUE, 1)],
    "orange-assembler": [(MatType.YELLOW, 1)],
    "green-assembler": [(MatType.PURPLE, 1), (MatType.ORANGE, 1)],
};

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
        // TODO figure out what type it is
        this.red += 1;

        entity.destroy();
    }
}

export class RenderInventory extends System<[ResourceCount, TextDisp]>
{
    types = () => [ResourceCount, TextDisp];

    update(delta: number): void
    {
        this.runOnEntities((entity, count, disp) => {
            disp.pixiObj.text = `RED: ${count.red} BLUE: ${count.blue} YELLOW: ${count.yellow} PURPLE: ${count.purple} ORANGE: ${count.orange} GREEN: ${count.green} `;
        });
    }
}

export class Inventory extends Entity
{
    constructor()
    {
        super("inv", 0, 0);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new ResourceCount(5, 0, 0, 0, 0, 0));
        this.addComponent(new TextDisp(50, 0, "", {fontSize: 20, align: "left", fill: "white"}));
        this.scene.addSystem(new RenderInventory());
    }

    buildMiner()
    {
        // check costs
    }

    buildStorage()
    {
        //
    }

    buildAssembler()
    {
        //
    }
}