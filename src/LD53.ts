import {HexGrid} from "./grid/Grid";
import {Game, GlobalSystem, Key, Log, LogLevel, Scene, SpriteSheet, TimerSystem} from 'lagom-engine';
import {PlacerGui} from "./PlacerGui";
import {BeltSystem} from "./tiles/Belt";
import {worldGen} from "./grid/worldGen";
import orangeSpr from "./Art/orange.png";
import blueSpr from "./Art/blue.png";
import beltSpr from "./Art/belt.png";
import {MatMover} from "./GridObject";
import {Inventory} from "./Inventory";

export enum Layers
{
    Grid,
    Ore,
    GridObject,
    Path,
    Item,
    Highlight,
}


class MainScene extends Scene
{
    onAdded()
    {
        this.camera.translate(-LD53.WINDOW_WIDTH / 2, -LD53.WINDOW_HEIGHT / 2);
        super.onAdded();
        this.addGUIEntity(new Inventory());
        this.addGUIEntity(new PlacerGui());
        this.addGlobalSystem(new CameraMover());
        this.addGlobalSystem(new TimerSystem());
        this.addSystem(new MatMover());

        this.addEntity(new HexGrid("Grid", 0, 0, Layers.Grid));

        // this.addEntity(new Belt("b1"));

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
        {
            if (this.scene.game.keyboard.isKeyDown(Key.KeyA))
            {
                this.scene.camera.translate(-this.moveSpeed * delta / 1000, 0);
            }
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

        Log.logLevel = LogLevel.INFO;

        this.addResource("orange", new SpriteSheet(orangeSpr, 32, 32));
        this.addResource("blue", new SpriteSheet(blueSpr, 32, 32));
        this.addResource("belt", new SpriteSheet(beltSpr, 32, 32));
        this.setScene(new MainScene(this));
    }
}
