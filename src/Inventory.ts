import {Component, Entity, RenderCircle, ScreenShake, System, TextDisp, Timer} from "lagom-engine";
import {Mat, MatType} from "./GridObject";
import {EndScore, EndSystem} from "./End";


export class ResourceCount extends Component
{
    constructor(public red: number,
                public blue: number,
                public yellow: number,
                public purple: number,
                public orange: number,
                public green: number)
    {
        super();
    }

    pay(type: MatType, amt: number)
    {
        switch (type)
        {
            case MatType.RED:
                this.red -= amt;
                break;
            case MatType.BLUE:
                this.blue -= amt;
                break;
            case MatType.YELLOW:
                this.yellow -= amt;
                break;
            case MatType.PURPLE:
                this.purple -= amt;
                break;
            case MatType.ORANGE:
                this.orange -= amt;
                break;
            case MatType.GREEN:
                this.green -= amt;
                break;
        }
    }

    addMat(entity: Entity)
    {
        switch ((entity as Mat).colour)
        {
            case MatType.RED:
                this.red++;
                break;
            case MatType.BLUE:
                this.blue++;
                break;
            case MatType.YELLOW:
                this.yellow++;
                break;
            case MatType.PURPLE:
                this.purple++;
                break;
            case MatType.ORANGE:
                this.orange++;
                break;
            case MatType.GREEN:
                this.green++;
                break;
        }

        entity.destroy();

        this.checkWin();
    }

    getCount(colour: MatType): number
    {
        switch (colour)
        {
            case MatType.RED:
                return this.red;
            case MatType.BLUE:
                return this.blue;
            case MatType.YELLOW:
                return this.yellow;
            case MatType.PURPLE:
                return this.purple;
            case MatType.ORANGE:
                return this.orange;
            case MatType.GREEN:
                return this.green;

        }
        return 0;
    }

    checkWin() {
        // For testing
        // const won = this.red >= 6
        //     && this.blue >= 0
        //     && this.yellow >= 0
        //     && this.green >= 0
        //     && this.purple >= 0
        //     && this.orange >= 0;


        const won = this.red >= 50
            && this.blue >= 50
            && this.yellow >= 50
            && this.green >= 50
            && this.purple >= 50
            && this.orange >= 50;

        if (won) {
            const endEntity = this.getScene().addEntity(new Entity("endEntity"));
            endEntity.addComponent(new EndScore());
            // const shake_time = 1000;
            // endEntity.addComponent(new ScreenShake(0.5, shake_time, ));
            //
            // Delay end to ensure shake
            // const timer = endEntity.addComponent(new Timer(0, () => endEntity.addComponent(new EndScore()), false));
            return;
        }
    }
}

export class RenderInventory extends System<[ResourceCount, TextDisp]>
{
    types = () => [ResourceCount, TextDisp];

    update(delta: number): void
    {
        this.runOnEntities((entity, count, disp) => {
            disp.pixiObj.text =
                `${count.red}\n${count.blue}\n${count.yellow}\n${count.purple}\n${count.orange}\n${count.green}`;
        });
    }
}

export class Inventory extends Entity
{
    constructor()
    {
        super("inv", 10, 280);
    }

    onAdded()
    {
        super.onAdded();
        this.addComponent(new ResourceCount(5, 0, 0, 0, 0, 0));
        this.addComponent(new TextDisp(10, -7, "", {fontSize: 10, fill: "white"}));
        this.addComponent(new RenderCircle(0, 0, 3, MatType.RED, MatType.RED));
        this.addComponent(new RenderCircle(0, 12, 3, MatType.BLUE, MatType.BLUE));
        this.addComponent(new RenderCircle(0, 24, 3, MatType.YELLOW, MatType.YELLOW));
        this.addComponent(new RenderCircle(0, 36, 3, MatType.PURPLE, MatType.PURPLE));
        this.addComponent(new RenderCircle(0, 48, 3, MatType.ORANGE, MatType.ORANGE));
        this.addComponent(new RenderCircle(0, 60, 3, MatType.GREEN, MatType.GREEN));


        this.scene.addSystem(new RenderInventory());
    }
}
