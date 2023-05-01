import {Component, GlobalSystem} from "lagom-engine";
import {EndScene} from "./LD53";

export class EndScore extends Component {}

export class EndSystem extends GlobalSystem
{
    starttime: number;

    constructor() {
        super();
        this.starttime = Date.now();
    }

    types = () => [EndScore];

    update(delta: number): void {
        this.runOnComponents((endScore: EndScore[]) => {
            // Dumb dumb
            if (endScore.length > 0) {
                const game = this.getScene().getGame();
                const elapsed = Math.floor((Date.now() - this.starttime)/1000);
                game.setScene(new EndScene(game, elapsed));
            }
        });
    }
}
