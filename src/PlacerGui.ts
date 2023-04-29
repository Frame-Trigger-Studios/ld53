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
    System
} from "lagom-engine";
import {LD53} from "./LD53";
import {Assembler, HexReference, MatStorage, Miner} from "./GridObject";
import {CustomHex, GRID} from "./grid/Grid";
import {Belt} from "./tiles/Belt";
import {Direction} from "honeycomb-grid";

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
        super("placements", center.x, center.y);
    }

    onAdded()
    {
        super.onAdded();
        // Add valid placement indicators around this one, if the spaces are free.
        const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];

        for (const dir of DIRS)
        {
            const neighbour = GRID.neighborOf(this.center, dir, {allowOutside: false});
            if (neighbour && neighbour?.entity == null)
            {
                const option = this.addChild(
                    new Entity("option", neighbour.x - this.transform.x, neighbour.y - this.transform.y));
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

    hilight(hex: CustomHex): void
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

                const hex = GRID.pointToHex(mousePos, {allowOutside: false});

                // Ivalid position.
                if (!hex) return;

                // Empty space
                if (hex.entity == null)
                {
                    // Check if we are adjacent to `highlighted` which was selected last time we clicked
                    if (this.highlighted && GRID.distance(hex, this.highlighted) == 1)
                    {

                        // Build a belt from highlighted -> hex
                        const entity = this.scene.addEntity(new Belt("aaa", hex.x, hex.y));
                        const dir = this.dirFor(hex, this.highlighted);
                        entity.addConnection(dir);
                        entity.addComponent(new HexReference(hex));
                        if (this.highlighted.entity instanceof Belt)
                        {
                            this.highlighted.entity.addConnection((dir + 3) % 6);
                        }
                        hex.entity = entity;
                        this.hilight(hex);

                    }
                    else
                    {
                        this.clearHilighted();

                        // This is just straight up empty, trigger building placement.
                        let entity: Entity | null = null;

                        switch (selected[0].idx)
                        {
                            case 0:
                                entity = new MatStorage("storage", hex.x, hex.y);
                                break;
                            case 1:
                                entity = new Assembler("assembler", hex.x, hex.y);
                                break;
                            case 2:
                                if (hex.terrain)
                                {
                                    entity = new Miner("miner", hex.x, hex.y);
                                }
                                break;
                        }

                        if (entity)
                        {
                            entity = this.scene.addEntity(entity);
                            entity.addComponent(new HexReference(hex));
                            hex.entity = entity;
                        }
                    }
                }
                else
                {
                    // Something is already here, select it for belt placement purposes.
                    this.hilight(hex);
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

    private clearHilighted()
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

            rect.pixiObj.y = selected.idx * 30;
        });
    }
}

export class PlacerGui extends Entity
{
    constructor()
    {
        super("placer gui", 0, 0);
    }

    onAdded()
    {
        super.onAdded();
        this.scene.addSystem(new PlaceSelector());
        this.scene.addGlobalSystem(new Placer());
        this.addComponent(new Selected());
        this.addComponent(new RenderRect(0, 0, 30, LD53.WINDOW_HEIGHT, 0x000020));

        // Mat storage
        this.addComponent(new RenderCircle(15, 15, 10, 0xFF0000));

        // Assembler
        this.addComponent(new RenderCircle(15, 45, 10, 0x0000FF));

        // Miner
        this.addComponent(new RenderCircle(15, 75, 10, 0x00FF00));

        this.addComponent(new Highlight(0, 0, 30, 30, null, 0x444444));


    }
}
