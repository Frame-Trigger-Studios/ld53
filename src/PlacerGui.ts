import {Component, Entity, Key, RenderCircle, RenderRect, System} from "lagom-engine";
import {LD53} from "./LD53";

class Selected extends Component {
    constructor(public idx: number = 0)
    {
        super();
    }
}

class Highlight extends RenderRect {

}
class PlaceSelector extends System<[Selected, Highlight]> {
    types = () => [Selected, Highlight];

    update(delta: number): void
    {
        this.runOnEntities((entity, selected, rect) => {
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit1)) {
                selected.idx = 0;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit2)) {
                selected.idx = 1;
            }
            if (this.scene.game.keyboard.isKeyPressed(Key.Digit3)) {
                selected.idx = 2;
            }

            rect.pixiObj.y = selected.idx * 30;
        });
    }
}
export class PlacerGui extends Entity {
    constructor()
    {
        super("placer gui", 0, 0);
    }
    onAdded()
    {
        super.onAdded();
        this.scene.addSystem(new PlaceSelector());
        this.addComponent(new Selected());
        this.addComponent(new RenderRect(0, 0, 30, LD53.WINDOW_HEIGHT, 0x000020));

        // Mat storage
        this.addComponent(new RenderCircle(15, 15, 10, 0xFF0000));

        // Assembler
        this.addComponent(new RenderCircle(15, 45, 10, 0x0000FF));

        // Miner
        this.addComponent(new RenderCircle(15, 75, 10, 0x00FF00));

        this.addComponent(new Highlight(0,0, 30, 30, null, 0x444444));


    }
}