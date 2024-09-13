type Coordinate = {x: number; y: number};

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
    /**
     *
     * Used to easily find the elements in a column and such.
     */
    #positionCache: string[][];
    #columnWidth: number;
    #container: undefined | HTMLElement;
    #elements: HTMLElement[];

    constructor(props: MasonryProps) {
        this.#positionCache = [];

        this.#container =
            "container" in props
                ? (document.querySelector(props.container) as HTMLElement)
                : undefined;
        this.#columnWidth =
            typeof props.columnWidth === "string"
                ? getXPositionOfElement(props.columnWidth)
                : props.columnWidth;

        if ("elements" in props && !("container" in props)) {
            this.#elements =
                typeof props.elements === "string"
                    ? Array.from(document.querySelectorAll(props.elements))
                    : props.elements;
        } else if (!("elements" in props) && "container" in props) {
            this.#elements = Array.from(this.#container.children).filter(
                (el) => el instanceof HTMLElement,
            );
        }

        if (this.#columnWidth <= 0) {
            throw new TypeError("Invalid columnWidth");
        }
    }

    layout(): void {}
}
