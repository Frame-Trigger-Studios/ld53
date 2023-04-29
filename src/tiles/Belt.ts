import {Component, Entity, System} from "lagom-engine";

class Belt extends Entity {

    onAdded() {
        this.addComponent(new InputBuffer());
        this.addComponent(new OutputBuffer());
        this.addComponent(new BeltSpeed(4));
    }
}

class BeltSpeed extends Component {
    private rate: number;

    constructor(rate: number) {
        super();
        this.rate = rate;
    }

    getRate = (): number => {
        return this.rate;
    };
}

class Buffer extends Component {
    private amount: number;

    constructor() {
        super();
        this.amount = 0;
    }

    /**
     * Attempts to remove an amount from the buffer.
     * @param reduction The amount to remove.
     * @return The actual amount that was removed,
     * e.g. if the buffer had 4 items and 6 items were removed, then you would receive 4.
     */
    removeAmount(reduction: number): number {
        if (this.amount < reduction) {
            const remainder = this.amount;
            this.amount = 0;
            return remainder;
        } else {
            this.amount -= reduction;
            return reduction;
        }
    }

    addAmount(reduction: number) {
        this.amount += reduction;
    }
}

class InputBuffer extends Buffer {}

class OutputBuffer extends Buffer {}

class BeltSystem extends System<[InputBuffer, OutputBuffer, BeltSpeed]> {

    types = () => [InputBuffer, OutputBuffer, BeltSpeed];

    update(delta: number) {
        // Todo enforce tick
        this.runOnEntities((entity: Entity, input: InputBuffer, output: OutputBuffer, rate: BeltSpeed) => {
            output.addAmount(input.removeAmount(rate.getRate()));
        });
    }
}