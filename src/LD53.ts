import {Game, Scene} from 'lagom-engine';
import {HexGrid} from "./grid/Grid";
import {Camera, Entity, Game, GlobalSystem, Key, RenderCircle, Scene} from 'lagom-engine';
import {Keyboard} from "lagom-engine/dist/Input/Keyboard";

class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();
        this.addGlobalSystem(new CameraMover());
        this.addEntity(new Entity("smeting", 0, 0))
            .addComponent(new RenderCircle(0, 0, 20));
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
