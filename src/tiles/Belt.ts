import {Component, Entity, System} from "lagom-engine";

export class Belt extends Entity {

    onAdded() {
        super.onAdded();
        this.addComponent(new InputBuffer(100, 99));
        this.addComponent(new OutputBuffer(13, 0));
        this.addComponent(new BeltSpeed(4));
    }
}

class BeltSpeed extends Component {
    constructor(readonly rate: number) {
        super();
    }
}

class Buffer extends Component {

    constructor(readonly limit: number, public amount: number = 0) {
        super();
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

    hasSpace(amount: number) {
        return this.amount + amount <= this.limit;
    }

    addAmount(addition: number) {
        if (addition + this.amount > this.limit) {
            this.amount = this.limit;
        } else {
            this.amount += addition;
        }
    }

    get(): number {
        return this.amount;
    }
}

class InputBuffer extends Buffer {}

class OutputBuffer extends Buffer {}

export class BeltSystem extends System<[InputBuffer, OutputBuffer, BeltSpeed]> {

    types = () => [InputBuffer, OutputBuffer, BeltSpeed];

    update(delta: number) {
        // Todo enforce tick
        this.runOnEntities((entity: Entity, input: InputBuffer, output: OutputBuffer, rate: BeltSpeed) => {
            if (input.get() > 0) {
                const retrieved = input.removeAmount(rate.rate);
                // The code looks good, much slower than before.
                if (output.hasSpace(retrieved)) {
                    output.addAmount(retrieved);
                    console.log(`Transferred ${retrieved} items from input to output: Input[${input.get()}] Output[${output.get()}]`);
                } else {
                    input.addAmount(retrieved);
                }
            }
        });
    }
}