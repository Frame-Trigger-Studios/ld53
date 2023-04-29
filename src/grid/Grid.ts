import {defineHex, Grid, Orientation, spiral} from 'honeycomb-grid';
import {Entity, RenderPoly} from "lagom-engine";
import {Point} from "pixi.js";

export class CustomHex extends defineHex({
    dimensions: 16,
    orientation: Orientation.FLAT,
}) {
    private capacity = 4;
    entity: Entity | null = null;
}

export const GRID = new Grid(CustomHex, spiral({radius: 8}));

export class HexGrid extends Entity {

    onAdded() {
        super.onAdded();

        GRID.forEach(hex => {
            this.addComponent(new RenderPoly(
                hex.corners.map(cnr => new Point(cnr.x, cnr.y))
            ));
        });
    }
}
