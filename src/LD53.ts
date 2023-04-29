import {HexGrid} from "./grid/Grid";
import {Camera, Entity, Game, GlobalSystem, Key, RenderCircle, Scene} from 'lagom-engine';
import {Assembler, MatStorage, Miner} from "./GridObject";
import {PlacerGui} from "./PlacerGui";

class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();
        this.addGUIEntity(new PlacerGui());
        this.addGlobalSystem(new CameraMover());
        this.addEntity(new Miner("miner", 120, 20));
        this.addEntity(new MatStorage("storage", 220, 20));
        this.addEntity(new Assembler("assembler", 320, 20));
        this.addEntity(new HexGrid("Grid", 0, 0, 0));
    }
}

export class CameraMover extends GlobalSystem {
    types = () => [];

    readonly moveSpeed: number = 150;
    update(delta: number): void
    {
        if (this.scene.game.keyboard.isKeyDown(Key.KeyA)) {
            this.scene.camera.translate(-this.moveSpeed * delta/1000, 0);
        }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyD)) {
            this.scene.camera.translate(this.moveSpeed * delta/1000, 0);
        }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyW)) {
            this.scene.camera.translate(0, -this.moveSpeed * delta/1000, );
        }
        if (this.scene.game.keyboard.isKeyDown(Key.KeyS)) {
            this.scene.camera.translate(0, this.moveSpeed * delta/1000, );
        }
    }
}



export class LD53 extends Game
{
    static WINDOW_WIDTH = 1280;

    static WINDOW_HEIGHT = 800;
    constructor()
    {
        super({
            width: LD53.WINDOW_WIDTH,
            height: LD53.WINDOW_HEIGHT,
            resolution: 1,
            backgroundColor: 0x200140
        });

        this.setScene(new MainScene(this));
    }
}
