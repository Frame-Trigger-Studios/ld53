import {Game, Scene} from 'lagom-engine';

class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

    }
}


export class LD53 extends Game
{
    constructor()
    {
        super({
            width: 512,
            height: 512,
            resolution: 1,
            backgroundColor: 0x200140
        });

        this.setScene(new MainScene(this));
    }
}
