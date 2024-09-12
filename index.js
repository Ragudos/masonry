/**
 * @typedef {Object} Rectangle
 * @property {number} positionX
 * @property {number} positionY
 * @property {number} width
 * @property {number} height
 */

class Masonry {
    /**
     *
     * @param {HTMLElement[] | string} elements Either a list of html elements or a className to target
     */
    constructor(elements) {}

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
}

export default Masonry;
