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
import {Assembler, MatStorage, Miner} from "./GridObject";
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
        // this.center.
        const DIRS = [Direction.N, Direction.NE, Direction.SE, Direction.S, Direction.SW, Direction.NW];
        for (const dir of DIRS)
        {
            const neighbour = GRID.neighborOf(this.center, dir, {allowOutside: false});
            if (neighbour && neighbour?.entity == null)
            {
                const option = this.addChild(new Entity("option", neighbour.x - this.transform.x, neighbour.y - this.transform.y));
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

                if (!hex) return;

                // Empty space, we want to put a building down
                if (hex.entity == null)
                {

                    let entity: Entity | null = null;

                    switch (selected[0].idx)
                    {
                        case 0:
                            entity = new MatStorage("aaa", hex.x, hex.y);
                            break;
                        case 1:
                            entity = new Assembler("aaa", hex.x, hex.y);
                            break;
                        case 2:
                            entity = new Miner("aaa", hex.x, hex.y);
                            break;
                        case 3:
                            entity = new Belt("aaa", hex.x, hex.y);
                            break;
                    }

                    if (entity)
                    {
                        entity = this.scene.addEntity(entity);
                        hex.entity = entity;
                    }
                } else
                {
                    // Something is already here, select it for road placement purposes.
                    this.highlighted = hex;
                    this.scene.getEntityWithName("placements")?.destroy();
                    this.scene.addEntity(new ValidPlacements(hex));
                    Log.info("we have chosen", this.highlighted);
                }
            });
        }
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