import {Component, Entity, System, TextDisp} from "lagom-engine";

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