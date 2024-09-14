type Coordinate = { x: number; y: number };
type MasonryBrick = {
    element: HTMLElement;
    shape: Rectangle;
    isPositioned: boolean;
};
type MasonryProps = {
    /**
     *
     * The width of each card or brick in pixels.
     *
     * A string specifying the CSS selector of an element, and its width
     * will be the value of this `columnWidth`.
     *
     * @default 240
     */
    columnWidth?: string | number;
    /**
     *
     * @default 12
     */
    columnGap?: number;

    /**
     *
     * @default 12
     */
    rowGap?: number;

    /**
     *
     * The boundary of the Masonry, or the `container` that
     * contains the contents of the bricks. If `container`
     * is provided, then that will be the default. This will
     * use `getElementById` if provided.
     *
     * @default Window | container
     */
    boundary?: string;
} & (
    | {
          /**
           *
           * A CSS selector of an element where, if it exists,
           * get its children and have them be the bricks
           * or elements to be laid out in Masonry.
           */
          container: string;
      }
    | {
          /**
           *
           * A list of `HTMLElement` that will be laid out
           * or a CSS selector to target the elements to be positioned.
           */
          elements: HTMLElement[] | string;
      }
);

abstract class Shape {
    isRectangle(): this is Rectangle {
        return this instanceof Rectangle;
    }

    abstract overlaps(shape: Shape): boolean;
}

class Rectangle extends Shape {
    positionCoordinate: Coordinate;
    dimensionCoordinate: Coordinate;

    constructor(posCoords: Coordinate, dimCoords: Coordinate) {
        super();

        this.positionCoordinate = posCoords;
        this.dimensionCoordinate = dimCoords;
    }

    overlaps(shape: Shape): boolean {
        if (shape.isRectangle()) {
            return (
                this.positionCoordinate.x <=
                    shape.positionCoordinate.x + shape.dimensionCoordinate.x &&
                this.positionCoordinate.x + this.dimensionCoordinate.x >=
                    shape.positionCoordinate.x &&
                this.positionCoordinate.y <=
                    shape.positionCoordinate.y + shape.dimensionCoordinate.y &&
                this.positionCoordinate.y + this.dimensionCoordinate.y >=
                    shape.positionCoordinate.y
            );
        }
    }
}

function isNumber(n: string): boolean {
    return typeof n === "string"
        ? (Number?.isFinite ? Number.isFinite(n) : isFinite(+n)) &&
              n.trim() !== ""
        : n - n === 0;
}

function getScrollPosition(): Coordinate {
    return {
        x: window.scrollX || document.documentElement.scrollLeft,
        y: window.scrollY || document.documentElement.scrollTop,
    };
}

function getRealPosition(position: Coordinate): Coordinate {
    const scrollPos = getScrollPosition();

    return {
        x: position.x + scrollPos.x,
        y: position.y + scrollPos.y,
    };
}

/**
 *
 * @param elOrIdentifier
 * @returns
 *
 * Only returns the base width and height of an element, not its real position
 * in the page/document.
 */
function getDimensionsOfElement(
    elOrIdentifier: string | HTMLElement,
): Coordinate {
    const el =
        elOrIdentifier instanceof HTMLElement
            ? elOrIdentifier
            : (document.querySelector(elOrIdentifier) as HTMLElement);

    return {
        x: el.offsetLeft,
        y: el.offsetTop,
    };
}

function getXPositionOfElement(elOrIdentifier: string | HTMLElement): number {
    const el =
        elOrIdentifier instanceof HTMLElement
            ? elOrIdentifier
            : (document.querySelector(elOrIdentifier) as HTMLElement);

    return el.offsetLeft;
}
function getYPositionOfElement(elOrIdentifier: string | HTMLElement): number {
    const el =
        elOrIdentifier instanceof HTMLElement
            ? elOrIdentifier
            : (document.querySelector(elOrIdentifier) as HTMLElement);

    return el.offsetTop;
}

class Masonry {
    #columnWidth: number;
    #boundary: Window | HTMLElement;
    #container: undefined | HTMLElement;
    #bricks: MasonryBrick[];

    #columnGap: number;
    #rowGap: number;

    constructor(props: MasonryProps) {
        this.#container =
            "container" in props
                ? (document.querySelector(props.container) as HTMLElement)
                : undefined;
        this.#boundary = props.boundary
            ? document.getElementById(props.boundary)
            : this.#container
              ? this.#container
              : window;
        this.#columnWidth =
            typeof props.columnWidth === "string"
                ? getXPositionOfElement(props.columnWidth)
                : props.columnWidth;

        this.#columnGap =
            props.columnGap !== undefined && props.columnGap !== null
                ? props.columnGap
                : 12;
        this.#rowGap =
            props.rowGap !== undefined && props.rowGap !== null
                ? props.rowGap
                : 12;

        if ("elements" in props && !("container" in props)) {
            this.#bricks = (
                typeof props.elements === "string"
                    ? Array.from(document.querySelectorAll(props.elements))
                    : props.elements
            ).map(this.#elementToMasonryBrick.bind(this));
        } else if (!("elements" in props) && "container" in props) {
            this.#bricks = Array.from(this.#container.children)
                .filter((el) => el instanceof HTMLElement)
                .map(this.#elementToMasonryBrick.bind(this));
        }

        if (this.#columnWidth <= 0) {
            throw new TypeError("Invalid columnWidth");
        }
    }

    #elementToMasonryBrick(element: HTMLElement): MasonryBrick {
        const domRect = element.getBoundingClientRect();

        return {
            element,
            shape: new Rectangle(
                { x: domRect.left, y: domRect.top },
                { x: domRect.width, y: domRect.height },
            ),
            isPositioned: false,
        };
    }

    layout(): void {
        const boundaryDomRect =
            this.#boundary instanceof Window
                ? undefined
                : this.#boundary.getBoundingClientRect();
        const boundaryWidth =
            this.#boundary instanceof Window
                ? this.#boundary.innerWidth - this.#columnWidth
                : boundaryDomRect.width;
        const boundaryPositionX =
            this.#boundary instanceof Window ? 0 : boundaryDomRect.left;
        const boundaryPositionY =
            this.#boundary instanceof Window ? 0 : boundaryDomRect.top;

        for (let i = 0; i < this.#bricks.length; ++i) {
            const brick = this.#bricks[i];

            if (i === 0) {
                brick.element.style.top = boundaryPositionX + "px";
                brick.element.style.left = boundaryPositionY + "px";
                brick.shape.positionCoordinate.x = boundaryPositionX;
                brick.shape.positionCoordinate.y = boundaryPositionY;

                continue;
            }

            const previousBrick = this.#bricks[i - 1];
            const previousBrickRealWidth =
                previousBrick.shape.positionCoordinate.x +
                previousBrick.shape.dimensionCoordinate.x +
                this.#columnGap;

            const newTmpPosX =
                previousBrickRealWidth < this.#columnWidth
                    ? this.#columnWidth + this.#columnGap
                    : previousBrickRealWidth;
            const newPosX =
                newTmpPosX >= boundaryWidth ? boundaryPositionX : newTmpPosX;

            let sameColBrick: undefined | MasonryBrick;

            for (let j = i - 1; j >= 0; --j) {
                if (this.#bricks[j].shape.positionCoordinate.x === newPosX) {
                    sameColBrick = this.#bricks[j];
                    break;
                }
            }

            if (sameColBrick) {
                const newPosY =
                    sameColBrick.shape.dimensionCoordinate.y +
                    sameColBrick.shape.positionCoordinate.y +
                    this.#rowGap;

                if (
                    sameColBrick.shape.overlaps(
                        new Rectangle(
                            {
                                x: newPosX,
                                y: sameColBrick.shape.positionCoordinate.y,
                            },
                            {
                                x: brick.shape.dimensionCoordinate.x,
                                y: brick.shape.dimensionCoordinate.y,
                            },
                        ),
                    )
                ) {
                    brick.element.style.top = newPosY + "px";
                    brick.shape.positionCoordinate.y = newPosY;
                }
            } else {
                brick.element.style.top = boundaryPositionY + "px";
                brick.shape.positionCoordinate.y = boundaryPositionY;
            }

            brick.element.style.left = newPosX + "px";
            brick.shape.positionCoordinate.x = newPosX;
        }
    }
}

export default Masonry;
