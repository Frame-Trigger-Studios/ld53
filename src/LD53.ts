import {HexGrid} from "./grid/Grid";
import {Game, GlobalSystem, Key, Scene, SpriteSheet} from 'lagom-engine';
import {PlacerGui} from "./PlacerGui";
import {Belt, BeltSystem} from "./tiles/Belt";
import {worldGen} from "./grid/worldGen";
import orangeSpr from "./Art/orange.png";

class MainScene extends Scene
{
    onAdded()
    {
        this.camera.translate(-LD53.WINDOW_WIDTH / 2, -LD53.WINDOW_HEIGHT / 2);
        super.onAdded();
        this.addGUIEntity(new PlacerGui());
        this.addGlobalSystem(new CameraMover());

        this.addEntity(new HexGrid("Grid", 0, 0, 0));

        this.addEntity(new Belt("b1"));

        this.addSystem(new BeltSystem());

        worldGen(this);
    }
}

export class CameraMover extends GlobalSystem
{
    types = () => [];

    readonly moveSpeed: number = 250;

    update(delta: number): void
    {
        if (this.scene.game.mouse.getPosX())


            if (this.scene.game.keyboard.isKeyDown(Key.KeyA))
            {
                this.scene.camera.translate(-this.moveSpeed * delta / 1000, 0);
            }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyD))
        {
            this.scene.camera.translate(this.moveSpeed * delta / 1000, 0);
        }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyW))
        {
            this.scene.camera.translate(0, -this.moveSpeed * delta / 1000,);
        }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyS))
        {
            this.scene.camera.translate(0, this.moveSpeed * delta / 1000,);
        }
    }
}


export class LD53 extends Game
{
    static WINDOW_WIDTH = 640;

    static WINDOW_HEIGHT = 360;

    constructor()
    {
        super({
            width: LD53.WINDOW_WIDTH,
            height: LD53.WINDOW_HEIGHT,
            resolution: 2,
            backgroundColor: 0x200140
        });

        this.addResource("orange", new SpriteSheet(orangeSpr, 32, 32));
        this.setScene(new MainScene(this));
    }
}
