/** @typedef {import("client/pixi/placeables/template.js").MeasuredTemplate} */

const angle_epsilon = 1;

/**
 * Convert point array to point object
 * @param arr {[x: number, y: number]}
 * @returns {Point}
 */
function a2p([x, y]) {
  return { x, y };
}

/**
 * Convert point object to point array
 * @param p {Point}
 * @returns {[x: number, y: number]}
 */
/* function p2a({ x, y }) {return [x, y];} */

/**
 * Extends the MeasuredTemplates to allow for templates that use grid
 * measurements to highlight instead of a shape.
 */
export class GAMeasuredTemplate extends MeasuredTemplate {
  /** @override */
  _getGridHighlightPositions() {
    /** @type {BaseGrid} */
    const grid = canvas.grid.grid;
    const [row, col] = grid.getGridPositionFromPixels(this.x, this.y);
    const base_area = this._getBaseArea(row, col);

    switch (this.document.t) {
      case "circle":
        return base_area;
      case "cone":
        // Create a unit vector in the template direction
        const r0 = Ray.fromAngle(
          this.x,
          this.y,
          Math.toRadians(this.document.direction),
          1
        );
        return [
          ...base_area.filter(p => {
            // Create a unit vector from the origin towards the grid cell
            let r1 = Ray.towardsPoint(this, a2p(grid.getCenter(p.x, p.y)), 1);
            // Calculate the angle between the two rays
            const theta = Math.acos(
              Math.clamped(-1, r0.dx * r1.dx + r0.dy * r1.dy, 1)
            );
            return (
              theta <= Math.toRadians(this.document.angle + angle_epsilon) / 2
            );
          }),
          // Add the orgin point
          a2p(grid.getTopLeft(this.x, this.y)),
        ];
    }

    return super._getGridHighlightPositions();
  }

  /**
   * Compute the base radius of the template. If the template is a
   * "circle" (radius) then this is the template.
   * @param {number} row
   * @param {number} col
   * @protected
   */
  _getBaseArea(row, col) {
    if (!canvas?.ready) return [];
    if (this.document.parent.grid.type === CONST.GRID_TYPES.SQUARE)
      return this._getBaseAreaSquare(row, col).map(a2p);
    if (
      [
        CONST.GRID_TYPES.HEXODDR,
        CONST.GRID_TYPES.HEXEVENR,
        CONST.GRID_TYPES.HEXODDQ,
        CONST.GRID_TYPES.HEXEVENQ,
      ].includes(this.document.parent.grid.type)
    )
      return this._getBaseAreaHex(row, col).map(a2p);
  }

  /**
   * @param {number} row
   * @param {number} col
   * @return {[x: number, y: number][]}
   * @protected
   */
  _getBaseAreaSquare(row, col) {
    /** @type {SquareGrid} */
    const grid = canvas.grid.grid;
    const spaces = [];
    const r = this._getRadiusInSpaces();
    const o = grid.getPixelsFromGridPosition(row, col);
    for (let i = -r; i <= r; ++i) {
      for (let j = -r; j <= r; ++j) {
        const ray = Ray.fromArrays(
          grid.getPixelsFromGridPosition(row + i, col + j),
          o
        );
        if (
          grid.measureDistances([{ ray }], { gridSpaces: true }) /
            this.document.parent.grid.distance <=
          r
        )
          spaces.push({ row: row + i, col: col + j });
      }
    }
    return spaces.map(({ row, col }) =>
      grid.getPixelsFromGridPosition(row, col)
    );
  }

  /**
   * @param {number} row
   * @param {number} col
   * @return {[x: number, y: number][]}
   * @protected
   */
  _getBaseAreaHex(row, col) {
    /** @type {HexagonalGrid} */
    const grid = canvas.grid.grid;
    const cube = grid.offsetToCube({ row, col });

    /** {GridHexCubeCoordinate[]} */
    const cubes = [];
    const r = this._getRadiusInSpaces();
    for (let i = -r; i <= r; ++i) {
      for (let j = Math.max(-r, -i - r); j <= Math.min(r, -i + r); ++j) {
        const k = -i - j;
        cubes.push({ q: cube.q + i, r: cube.r + j, s: cube.s + k });
      }
    }
    return cubes
      .map(c => grid.cubeToOffset(c))
      .map(({ row, col }) => grid.getPixelsFromGridPosition(row, col));
  }

  /**
   * @return {number}
   * @protected
   */
  _getRadiusInSpaces() {
    return Math.round(
      this.document.distance / this.document.parent.grid.distance
    );
  }
}
