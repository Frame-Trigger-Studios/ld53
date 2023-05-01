import {HexGrid} from "./grid/Grid";
import {
    AudioAtlas,
    Component, Entity, FrameTriggerSystem,
    Game,
    GlobalSystem,
    Key,
    Log,
    LogLevel,
    Scene,
    SpriteSheet, TextDisp,
    TimerSystem
} from 'lagom-engine';
import {PlacerGui} from "./PlacerGui";
import {BeltSystem} from "./tiles/Belt";
import {worldGen} from "./grid/worldGen";
import orangeSpr from "./Art/orange.png";
import blueSpr from "./Art/blue.png";
import beltSpr from "./Art/belt.png";
import {MatMover} from "./GridObject";
import {Inventory} from "./Inventory";

import soundtrack from "./sound/LD53-music.mp3";
import {EndSystem} from "./End";

export enum Layers
{
    Grid,
    Ore,
    GridObject,
    Path,
    Item,
    Highlight,
    Menu
}


class MainScene extends Scene
{
    onAdded()
    {
        this.camera.translate(-LD53.WINDOW_WIDTH / 2, -LD53.WINDOW_HEIGHT / 2);
        super.onAdded();
        this.addGUIEntity(new PlacerGui());
        this.addGUIEntity(new Inventory());
        this.addGlobalSystem(new CameraMover());
        this.addGlobalSystem(new TimerSystem());
        this.addSystem(new MatMover());

        this.addEntity(new HexGrid("Grid", 0, 0, Layers.Grid));

        this.addSystem(new BeltSystem());
        this.addGlobalSystem(new EndSystem());

        worldGen(this);
    }
}

export class CameraMover extends GlobalSystem
{
    types = () => [];

    readonly moveSpeed: number = 250;

    update(delta: number): void
    {
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

    static audioAtlas: AudioAtlas = new AudioAtlas();

    constructor()
    {
        super({
            width: LD53.WINDOW_WIDTH,
            height: LD53.WINDOW_HEIGHT,
            resolution: 2,
            backgroundColor: 0x200140
        });

        Log.logLevel = LogLevel.INFO;

        const music = LD53.audioAtlas.load("music", soundtrack);
        music.loop(true);
        music.volume(0.25);

        this.addResource("orange", new SpriteSheet(orangeSpr, 32, 32));
        this.addResource("blue", new SpriteSheet(blueSpr, 32, 32));
        this.addResource("belt", new SpriteSheet(beltSpr, 32, 32));
        this.setScene(new MainScene(this));

        LD53.audioAtlas.play("music");
        this.resourceLoader.loadAll().then(() => this.setScene(new MainMenuScene(this)));
    }
}


class ClickAction extends Component
{
    constructor(readonly action: number)
    {
        super();
    }

    onAction()
    {
        const game = this.getScene().getGame();
        switch (this.action)
        {
            case 0:
            {
                game.setScene(new MainScene(game));
                break;
            }
        }
    }
}

class MainMenuClickListener extends GlobalSystem
{
    types = () => [ClickAction];

    update(delta: number): void
    {
        this.runOnComponents((actions: ClickAction[]) =>
        {
            if (this.getScene().getGame().keyboard.isKeyPressed(Key.Space))
            {
                for (const action of actions)
                {
                    action.onAction();
                    //button.destroy();
                }
            }
        });
    }
}

export class MainMenuScene extends Scene
{
    onAdded()
    {
        super.onAdded();
        const title = this.addEntity(new Entity("title", 0, 0, Layers.Menu));

        // title.addComponent(new AnimatedSprite(this.game.getResource("title").textureSliceFromSheet(), {
        //     animationSpeed: 1000
        // }));
        title.addComponent(new ClickAction(0));

        title.addComponent(new TextDisp(150, 0, "Press Space to start", {fontSize: 30, align: "center", fill: "white"}));

        this.addGlobalSystem(new MainMenuClickListener());
        this.addGlobalSystem(new FrameTriggerSystem());

    }

}

export class EndScene extends Scene
{
    constructor(game: Game, readonly time_s: number) {
        super(game);
    }

    onAdded()
    {
        const screenHeight = LD53.WINDOW_HEIGHT;
        const screenWidth = LD53.WINDOW_WIDTH;

        super.onAdded();
        const endCard = this.addEntity(new Entity("end-card"));
        // endCard.addComponent(new Sprite(this.game.getResource("end-card").texture(0, 0)));
        endCard.addComponent(new TextDisp(screenWidth / 4 + 10, screenHeight / 2 - 50, "Well done! You mixed the colours in:", { fill: 0xf6cd26, fontSize: 20 }));
        endCard.addComponent(new TextDisp(screenWidth / 4 + 10, screenHeight / 2, this.time_s.toString() + " seconds!", { fill: 0xf6cd26, fontSize: 30 }));
        endCard.addComponent(new TextDisp(screenWidth / 4 + 10, screenHeight / 2 + 60, "F5 to play again", { fill: 0xf6cd26, fontSize: 20 }));
    }
}
