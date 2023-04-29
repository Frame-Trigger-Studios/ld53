import {Button, Component, Entity, GlobalSystem, Key, Log, RenderCircle, RenderRect, System} from "lagom-engine";
import {LD53} from "./LD53";
import {Assembler, HexReference, MatStorage, Miner} from "./GridObject";
import {GRID} from "./grid/Grid";

class Selected extends Component
{
    constructor(public idx: number = 0)
    {
        super();
    }
}

class Highlight extends RenderRect
{

}

class Placer extends GlobalSystem
{
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

                if (hex && hex.entity == null) {

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
                            if (hex.terrain) {
                                entity = new Miner("aaa", hex.x, hex.y);
                            }
                            break;
                    }

                    if (entity) {
                        entity = this.scene.addEntity(entity);
                        entity.addComponent(new HexReference(hex));
                        hex.entity = entity;
                    }

                }
            });
        }
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