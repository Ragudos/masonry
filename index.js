// TODO: A way to resize elements, making them more responsive

/**
 * @typedef {Object} Rectangle
 * @property {number} positionX
 * @property {number} positionY
 * @property {number} width
 * @property {number} height
 */

/**
 *
 * @typedef {Object} MasonryItem
 * @property {HTMLElement} element
 * @property {Rectangle} shape
 * @property {boolean} isPositioned
 */

class Masonry {
    /**
     *
     * @type {MasonryItem[]}
     */
    #items;

    /**
     *
     * @param {HTMLElement[]} items
     */
    constructor(items) {
        for (let i = 0; i < items.length; ++i) {
            items[i].style.position = "absolute";
        }

        this.#items = items.map((el) => {
            const elDimensions = el.getBoundingClientRect();
            const position = this.#getPositionOf(elDimensions);

            return {
                element: el,
                shape: {
                    width: elDimensions.width,
                    height: elDimensions.height,
                    positionX: position.left,
                    positionY: position.top,
                },
                isPositioned: false,
            };
        });
    }

    #getDocumentScrollPosition() {
        return {
            top: window.scrollY || document.documentElement.scrollTop,
            left: window.scrollX || document.documentElement.scrollLeft,
        };
    }

    /**
     *
     * @param {HTMLElement | DOMRect} el
     */
    #getPositionOf(el) {
        const scrollPos = this.#getDocumentScrollPosition();
        /**
         *
         * @type {DOMRect}
         */
        let elDimensions;

        if (el instanceof DOMRect) {
            elDimensions = el;
        } else {
            elDimensions = el.getBoundingClientRect();
        }

        return {
            top: scrollPos.top + elDimensions.top,
            left: scrollPos.left + elDimensions.left,
        };
    }

    /**
     *
     * @param {Rectangle} rect1
     * @param {Rectangle} rect2
     *
     * @returns {boolean} a bool whether `rect1` collides with `rect2`
     */
    #rectanglesCollides(rect1, rect2) {
        return (
            rect1.positionX <= rect2.positionX + rect2.width &&
            rect1.positionX + rect1.width >= rect2.positionX &&
            rect1.positionY <= rect2.positionY + rect2.height &&
            rect1.positionY + rect1.height >= rect2.positionY
        );
    }

    /**
     *
     * Positions the elements in masonry format
     */
    reposition() {
        const columnWidth = window.innerWidth - 300;
        // TODO: Check if we need to reposition and such
        // This is just a prototype and bad code

        for (let i = 0; i < this.#items.length; ++i) {
            const itemToPosition = this.#items[i];

            if (i === 0) {
                continue;
            }

            const itemBefore = this.#items[i - 1];
            const newPosX =
                itemBefore.shape.positionX + itemBefore.shape.width + 2;
            let newPosY = itemBefore.shape.positionY + itemBefore.shape.height + 2;

            /**
             * @type {Rectangle}
             */
            const tmpShape = {
                positionX: newPosX >= columnWidth ? 8 : newPosX,
                // We should start at the column above usssssssssssssssssssssssss
                positionY: itemToPosition.shape.positionY,
                width: itemToPosition.shape.width,
                height: itemToPosition.shape.height,
            };

            let shouldMoveDown = false;

            // Very inefficient
            // we start from top
            // if collides, means we on same column
            // so move down
            // and update tmpshape to be that.
            // We cannot instantly have the nearest column above since the tmpshape starts
            // at the very beginning/top, so the collision detection will return false.
            // Possibly, we can make a function to detect whether a rect is in a column of another's.
            // Either with quad trees, or other algorithms.
            for (let j = 0; j < i; ++j) {
                if (this.#rectanglesCollides(tmpShape, this.#items[j].shape)) {
                    const newP = this.#items[j].shape.positionY +
                        this.#items[j].shape.height +
                        2;
                    newPosY = newP;

                    tmpShape.positionY = newPosY
                    shouldMoveDown = true;
                }
            }

            if (newPosX >= columnWidth) {
                itemToPosition.element.style.top = newPosY + "px";
                itemToPosition.shape.positionY = newPosY;

                continue;
            }

            itemToPosition.element.style.left = newPosX + "px";
            itemToPosition.shape.positionX = newPosX;

            if (shouldMoveDown) {
                itemToPosition.element.style.top = newPosY + "px";
                itemToPosition.shape.positionY = newPosY;
            }
        }
    }
}

export default Masonry;
