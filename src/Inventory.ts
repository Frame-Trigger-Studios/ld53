import {Component, Entity} from "lagom-engine";

export class ResourceCount extends Component
{
    constructor(public mat1: number, public mat2: number, public mat3: number)
    {
        super();
    }

    addMat(entity: Entity)
    {
        // TODO figure out what type it is
        this.mat1 += 1;

        entity.destroy();
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
        this.addComponent(new ResourceCount(0, 0, 0));
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