import {defineHex, Grid, Orientation, rectangle} from 'honeycomb-grid';
import {Entity, RenderPoly, RenderRect} from "lagom-engine";
import {Point} from "pixi.js";

export class CustomHex extends defineHex({
    dimensions: 30,
    orientation: Orientation.FLAT,
}) {
    private capacity = 4;
}

export class HexGrid extends Entity {

    private grid = new Grid(CustomHex, rectangle({width: 10, height: 10}));
    onAdded() {
        super.onAdded();

        this.grid.forEach(hex => {
            this.addComponent(new RenderPoly(
                hex.corners.map(cnr => new Point(cnr.x, cnr.y))
            ));
        });
    }
}
