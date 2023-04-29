import {Game, Scene} from 'lagom-engine';
import {HexGrid} from "./grid/Grid";

class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        this.addEntity(new HexGrid("Grid", 0, 0, 0));
    }
}



export class LD53 extends Game
{
    constructor()
    {
        super({
            width: 1280,
            height: 800,
            resolution: 1,
            backgroundColor: 0x200140
        });

        this.setScene(new MainScene(this));
    }
}
