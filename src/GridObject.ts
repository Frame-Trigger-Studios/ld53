import {Component, Entity, RenderCircle} from "lagom-engine";

export class GridObject extends Component
{
    constructor(readonly x: number, readonly y: number, readonly z: number)
    {
        super();
    }
}


export class MatStorage extends Entity {
    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0xFF0000));
    }
}
export class Assembler extends Entity {
    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0x0000FF));
    }
}
export class Miner extends Entity {
    onAdded()
    {
        super.onAdded();
        this.addComponent(new RenderCircle(0, 0, 10, 0x00FF00));
    }
}