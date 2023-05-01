import {
    Button,
    Component,
    Entity,
    GlobalSystem,
    Key,
    Log,
    RenderCircle,
    RenderRect,
    Sprite,
    System,
    TextDisp
} from "lagom-engine";
import {Layers, LD53} from "./LD53";
import {AllowInput, Assembler, HexReference, MatType, Miner} from "./GridObject";
import {CustomHex, GRID} from "./grid/Grid";
import {Belt} from "./tiles/Belt";
import {Direction} from "honeycomb-grid";
import {MatTypeHolder} from "./grid/worldGen";
import {ResourceCount} from "./Inventory";

class Selected extends Component
{
    constructor(public idx: number = 0)
    {
        super();
    }
}

class SelectedHex extends Component
{

}

class Highlight extends RenderRect
{
}

class ValidPlacements extends Entity
{
    constructor(readonly center: CustomHex)
    {
        super("placements", center.x, center.y, Layers.Highlight);
    }

    onAdded()
    {
        super.onAdded();
        // Add valid placement indicators around this one, if the spaces are free.
        const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];

        for (const dir of DIRS)
        {
            const neighbour = GRID.neighborOf(this.center, dir, {allowOutside: false});
            if (neighbour && (neighbour?.entity == null || neighbour?.entity?.getComponent(AllowInput) != null))
            {
                const option = this.addChild(
                    new Entity("option", neighbour.x - this.transform.x, neighbour.y - this.transform.y,
                        Layers.Highlight));
                option.addComponent(new Sprite(this.scene.game.getResource("blue").textureFromIndex(0), {
                    xOffset: -16,
                    yOffset: -16
                }));
            }
        }
    }
}

class Placer extends GlobalSystem
{
    private highlighted: CustomHex | undefined = undefined;

    types = () => [Selected];

    highlight(hex: CustomHex): void
    {
        this.highlighted = hex;
        this.scene.getEntityWithName("placements")?.destroy();
        this.scene.addEntity(new ValidPlacements(hex));
        Log.info("we have chosen", this.highlighted);
    }

    update(delta: number): void
    {
        if (this.scene.game.mouse.isButtonPressed(Button.LEFT))
        {
            this.runOnComponents((selected: Selected[]) => {
                if (selected.length == 0) return;
                // Determine which grid square is under the mouse.
                const mx = this.scene.game.mouse.getPosX();
                const my = this.scene.game.mouse.getPosY();
                const mousePos = this.scene.camera.viewToWorld(mx, my);

                const chosenHex = GRID.pointToHex(mousePos, {allowOutside: false});

                // Invalid position.
                if (!chosenHex) return;

                // Empty space or awaiting connection
                if (chosenHex.entity == null || chosenHex.entity.getComponent(AllowInput))
                {
                    // Check if we are adjacent to `highlighted` which was selected last time we clicked
                    if (this.highlighted && GRID.distance(chosenHex, this.highlighted) == 1)
                    {
                        let destEntity = chosenHex.entity;
                        if (destEntity == null)
                        {
                            destEntity = chosenHex.entity ??
                                this.scene.addEntity(new Belt("aaa", chosenHex.x, chosenHex.y, Layers.GridObject));
                        }
                        chosenHex.entity = destEntity;

                        // Build a belt from highlighted -> hex
                        const dir = this.dirFor(chosenHex, this.highlighted);
                        this.highlighted.dest = chosenHex;
                        if (destEntity instanceof Belt)
                        {
                            destEntity.addConnection(dir);
                            destEntity.addComponent(new HexReference(chosenHex));
                        }
                        if (this.highlighted.entity instanceof Belt)
                        {
                            this.highlighted.entity.addConnection((dir + 3) % 6);
                        }
                        if (destEntity instanceof Belt)
                        {
                            // highlight if non-terminating
                            this.highlight(chosenHex);
                        }
                        else
                        {
                            this.clearHighlighted();
                        }
                    }
                    else
                    {
                        this.clearHighlighted();

                        if (chosenHex.entity instanceof Assembler)
                        {
                            this.highlight(chosenHex);
                            return;
                        }

                        // This is just straight up empty, trigger building placement.
                        let entity: Entity | null = null;

                        if (chosenHex.terrain)
                        {
                            switch (selected[0].idx)
                            {
                                case 0:
                                    if (chosenHex.terrain.getComponent<MatTypeHolder>(MatTypeHolder)?.type ===
                                        MatType.RED && this.payForIt(MatType.RED))
                                    {
                                        entity = new Miner(chosenHex, MatType.RED);
                                    }
                                    break;
                                case 1:
                                    if (chosenHex.terrain.getComponent<MatTypeHolder>(MatTypeHolder)?.type ===
                                        MatType.BLUE && this.payForIt(MatType.BLUE))
                                    {
                                        entity = new Miner(chosenHex, MatType.BLUE);
                                    }
                                    break;
                                case 2:
                                    if (chosenHex.terrain.getComponent<MatTypeHolder>(MatTypeHolder)?.type ===
                                        MatType.YELLOW && this.payForIt(MatType.YELLOW))
                                    {
                                        entity = new Miner(chosenHex, MatType.YELLOW);
                                    }
                                    break;
                            }
                        }
                        else
                        {
                            switch (selected[0].idx)
                            {
                                case 3:
                                    if (this.payForIt(MatType.PURPLE))
                                    {
                                        entity = new Assembler(chosenHex, MatType.PURPLE);
                                    }
                                    break;
                                case 4:
                                    if (this.payForIt(MatType.GREEN))
                                    {
                                        entity = new Assembler(chosenHex, MatType.GREEN);
                                    }
                                    break;
                                case 5:
                                    if (this.payForIt(MatType.ORANGE))
                                    {
                                        entity = new Assembler(chosenHex, MatType.ORANGE);
                                    }
                                    break;
                            }
                        }

                        if (entity)
                        {
                            entity = this.scene.addEntity(entity);
                            entity.addComponent(new HexReference(chosenHex));
                            chosenHex.entity = entity;
                        }
                    }
                }
                else
                {
                    // Something is already here, select it for belt placement purposes.
                    Log.info(chosenHex);
                    // Already has an outgoing connection
                    if (chosenHex?.dest != null) return;

                    this.highlight(chosenHex);
                }
            });
        }
    }

    private dirFor(hex1: CustomHex, hex2: CustomHex): number
    {
        const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];
        for (let i = 0; i < DIRS.length; i++)
        {
            const dir = DIRS[i];
            const neighbour = GRID.neighborOf(hex1, dir, {allowOutside: false});
            if (neighbour?.equals(hex2)) return i;
        }

        return -1;
    }

    private clearHighlighted()
    {
        this.highlighted = undefined;
        this.scene.getEntityWithName("placements")?.destroy();
    }

    private payForIt(mat: MatType): boolean
    {
        const inv = this.scene.getEntityWithName("inv")?.getComponent<ResourceCount>(ResourceCount);
        if (!inv) return false;

        let good = true;

        // get the cost
        const cost = COSTS.get(mat) as Costs;
        for (const entry of Array.from(cost.amts.entries()))
        {
            const key = entry[0];
            const value = entry[1];

            if (inv.getCount(key) < value) {
                good = false;
            }
        }

        if (good) {
            for (const entry of Array.from(cost.amts.entries()))
            {
                const key = entry[0];
                const value = entry[1];

                inv.pay(key, value);
            }
            return true;
        }

        return false;
    }
}

class Costs
{
    constructor(readonly amts: Map<MatType, number>)
    {
    }
}

const COSTS = new Map<MatType, Costs>([
    [MatType.RED, new Costs(new Map<MatType, number>([[MatType.RED, 5]]))],
    [MatType.BLUE, new Costs(new Map<MatType, number>([[MatType.RED, 10]]))],
    [MatType.YELLOW, new Costs(new Map<MatType, number>([[MatType.PURPLE, 20], [MatType.BLUE, 40]]))],
    [MatType.PURPLE, new Costs(new Map<MatType, number>([[MatType.RED, 10], [MatType.BLUE, 10]]))],
    [MatType.ORANGE, new Costs(new Map<MatType, number>([[MatType.YELLOW, 20], [MatType.PURPLE, 10]]))],
    [MatType.GREEN, new Costs(new Map<MatType, number>([[MatType.PURPLE, 10], [MatType.ORANGE, 20]]))],
]);


export class BeltPlacer extends System<[Selected]>
{
    types = () => [Selected];

    update(delta: number): void
    {
        this.runOnEntities((e, selected) => {
            selected.idx = 3;
        });
    }
}

class PlaceSelector extends System<[Selected, Highlight]>
{
    types = () => [Selected, Highlight];

    update(delta: number): void
    {
        this.runOnEntities((entity, selected, rect) => {
            if (this.scene.game.mouse.isButtonPressed(Button.LEFT)) {
                const mx = this.scene.game.mouse.getPosX();
                const my = this.scene.game.mouse.getPosY();
                const mousePos = this.scene.camera.viewToWorld(mx, my);
                const pos = this.scene.camera.position();

                const guiX = mousePos.x - pos.x;
                const guiY = mousePos.y - pos.y;

                if (guiX > 62) return;

                const idx = Math.floor(guiY / 30) - 1;

                if (idx >= 0 && idx < 6) {
                    selected.idx = idx;
                }
                rect.pixiObj.transform.position.y = (selected.idx) * 30;
            }
        });
    }
}

class Hint extends Component
{
}

class CanPlaceColour extends System<[RenderCircle, TextDisp, Hint]>
{
    types = () => [RenderCircle, TextDisp, Hint];

    update(delta: number): void
    {
        this.runOnEntities((entity, circle, text) => {
            const count = entity.scene.getEntityWithName("inv")?.getComponent<ResourceCount>(ResourceCount);
            if (count == null) return;

            const colour = circle.pixiObj.fill.color;
            const number = count.getCount(colour);

            const req = +text.pixiObj.text;
            if (number >= req)
            {
                text.pixiObj.style.fill = "white";
            }
            else
            {
                text.pixiObj.style.fill = "gray";
            }
        });
    }
}

export class PlacerGui extends Entity
{
    constructor()
    {
        super("gui", 0, 0);
    }

    cost(sx: number, costs: Costs)
    {
        let offset = sx;

        for (const entry of Array.from(costs.amts.entries()))
        {
            const key = entry[0];
            const value = entry[1];
            this.cost2(offset, key, value);
            offset += 10;
        }
    }

    cost2(offset: number, type: MatType, value: number)
    {
        const e = this.addChild(new Entity("cost", 40, offset));
        e.addComponent(new RenderCircle(0, 0, 3, type, type));
        e.addComponent(new TextDisp(8, -7, value.toString(), {fontSize: 10, fill: "white"}));
        e.addComponent(new Hint());
    }

    onAdded()
    {
        super.onAdded();
        this.scene.addSystem(new PlaceSelector());
        this.scene.addGlobalSystem(new Placer());
        this.scene.addSystem(new CanPlaceColour());

        this.addComponent(new Selected());
        this.addComponent(new RenderRect(0, 0, 62, LD53.WINDOW_HEIGHT, 0x000020, 0x000020));

        // red
        this.addComponent(new RenderCircle(15, 45, 8, MatType.RED, MatType.RED));
        this.cost(39, COSTS.get(MatType.RED) as Costs);

        // blue
        this.addComponent(new RenderCircle(15, 75, 8, MatType.BLUE, MatType.BLUE));
        this.cost(69, COSTS.get(MatType.BLUE) as Costs);

        // yellow
        this.addComponent(new RenderCircle(15, 105, 8, MatType.YELLOW, MatType.YELLOW));
        this.cost(99, COSTS.get(MatType.YELLOW) as Costs);

        // purple
        this.addComponent(new RenderCircle(15, 135, 8, 0x0, MatType.PURPLE));
        this.addComponent(new RenderCircle(15, 135, 6, 0x0, MatType.PURPLE));
        this.addComponent(new RenderCircle(15, 135, 4, 0x0, MatType.PURPLE));
        this.addComponent(new RenderCircle(15, 135, 2, 0x0, MatType.PURPLE));
        this.cost(129, COSTS.get(MatType.PURPLE) as Costs);

        // green
        this.addComponent(new RenderCircle(15, 165, 8, 0x0, MatType.GREEN));
        this.addComponent(new RenderCircle(15, 165, 6, 0x0, MatType.GREEN));
        this.addComponent(new RenderCircle(15, 165, 4, 0x0, MatType.GREEN));
        this.addComponent(new RenderCircle(15, 165, 2, 0x0, MatType.GREEN));
        this.cost(159, COSTS.get(MatType.GREEN) as Costs);

        // orange
        this.addComponent(new RenderCircle(15, 195, 8, 0x0, MatType.ORANGE));
        this.addComponent(new RenderCircle(15, 195, 6, 0x0, MatType.ORANGE));
        this.addComponent(new RenderCircle(15, 195, 4, 0x0, MatType.ORANGE));
        this.addComponent(new RenderCircle(15, 195, 2, 0x0, MatType.ORANGE));
        this.cost(189, COSTS.get(MatType.ORANGE) as Costs);

        this.addComponent(new Highlight(1, 31, 60, 30, null, 0xFFFFFF));

        this.addComponent(new TextDisp(4,10,"SHOP", {fill: "white", fontSize: 15}));
        this.addComponent(new TextDisp(4,250,"SCORE", {fill: "white", fontSize: 15}));
    }
}
