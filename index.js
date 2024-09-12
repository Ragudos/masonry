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
     * @returns
     */
    #collides(rect1, rect2) {}
}

export default Masonry;
