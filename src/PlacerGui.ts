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
                                        MatType.RED)
                                    {
                                        entity = new Miner(chosenHex, MatType.RED);
                                    }
                                    break;
                                case 1:
                                    if (chosenHex.terrain.getComponent<MatTypeHolder>(MatTypeHolder)?.type ===
                                        MatType.BLUE)
                                    {
                                        entity = new Miner(chosenHex, MatType.BLUE);
                                    }
                                    break;
                                case 2:
                                    if (chosenHex.terrain.getComponent<MatTypeHolder>(MatTypeHolder)?.type ===
                                        MatType.YELLOW)
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
                                    entity = new Assembler(chosenHex, MatType.PURPLE);
                                    break;
                                case 4:
                                    entity = new Assembler(chosenHex, MatType.GREEN);
                                    break;
                                case 5:
                                    entity = new Assembler(chosenHex, MatType.ORANGE);
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
}

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
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit1))
            {
                selected.idx = 0;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit2))
            {
                selected.idx = 1;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit3))
            {
                selected.idx = 2;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit4))
            {
                selected.idx = 3;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit5))
            {
                selected.idx = 4;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit6))
            {
                selected.idx = 5;
            }


            rect.pixiObj.y = selected.idx * 30;
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
            if (number >= req) {
                text.pixiObj.style.fill = "white";
            } else {
                text.pixiObj.style.fill = "red";
            }
        });
    }
}

export class PlacerGui extends Entity
{
    constructor()
    {
        super("placer gui", 0, 0);
    }

    cost(sx: number, r = 0, b = 0, y = 0, p = 0, g = 0, o = 0)
    {
        let offset = sx;

        if (r)
        {
            this.cost2(offset, MatType.RED);
            offset += 10;
        }
        if (b)
        {
            this.cost2(offset, MatType.BLUE);
            offset += 10;
        }
        if (y)
        {
            this.cost2(offset, MatType.YELLOW);
            offset += 10;
        }
        if (p)
        {
            this.cost2(offset, MatType.PURPLE);
            offset += 10;
        }
        if (g)
        {
            this.cost2(offset, MatType.GREEN);
            offset += 10;
        }
        if (o)
        {
            this.cost2(offset, MatType.ORANGE);
        }
    }

    cost2(offset: number, type: MatType)
    {
        const e = this.addChild(new Entity("cost", 40, offset));
        e.addComponent(new RenderCircle(0, 0, 3, type, type));
        e.addComponent(new TextDisp(8, -7, "1", {fontSize: 10, fill: "white"}));
        e.addComponent(new Hint());
    }

    onAdded()
    {
        super.onAdded();
        this.scene.addSystem(new PlaceSelector());
        this.scene.addGlobalSystem(new Placer());
        this.scene.addSystem(new CanPlaceColour());
        this.addComponent(new Selected());
        this.addComponent(new RenderRect(0, 0, 60, LD53.WINDOW_HEIGHT, 0x000020, 0x000020));

        // red
        this.addComponent(new RenderCircle(15, 15, 8, MatType.RED, MatType.RED));
        this.cost(7, 1, 5);

        // blue
        this.addComponent(new RenderCircle(15, 45, 8, MatType.BLUE, MatType.BLUE));

        // yellow
        this.addComponent(new RenderCircle(15, 75, 8, MatType.YELLOW, MatType.YELLOW));

        // purple
        this.addComponent(new RenderCircle(15, 105, 8, 0x0, MatType.PURPLE));

        // green
        this.addComponent(new RenderCircle(15, 135, 8, 0x0, MatType.GREEN));

        // orange
        this.addComponent(new RenderCircle(15, 165, 8, 0x0, MatType.ORANGE));

        this.addComponent(new Highlight(0, 0, 30, 30, null, 0x444444));
    }
}
