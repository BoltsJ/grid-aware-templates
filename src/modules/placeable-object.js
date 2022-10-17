const angle_epsilon = 1;

/**
 * Extends the MeasuredTemplates to allow for templates that use grid
 * measurements to highlight instead of a shape.
 */
export class GAMeasuredTemplate extends MeasuredTemplate {
  /** @override */
  _getGridHighlightPositions() {
    /*
    if (!this.document.getFlag("grid-aware-templates", "enabled"))
      return super._getGridHighlightPositions();
    */
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
            // Create a vector from the origin to the grid cell
            let r1 = Ray.fromArrays([this.x, this.y], grid.getCenter(p.x, p.y));
            // Calculate the angle between the two rays
            const theta = Math.acos(
              Math.clamped(-1, (r0.dx * r1.dx + r0.dy * r1.dy) / r1.distance, 1)
            );
            return (
              theta <= Math.toRadians(this.document.angle + angle_epsilon) / 2
            );
          }),
          (() => {
            // Add the orgin point
            const tl = grid.getTopLeft(this.x, this.y);
            return { x: tl[0], y: tl[1] };
          })(),
        ];
    }

    return super._getGridHighlightPositions();
  }

  /**
   * Compute the base radius of the template. If the template is a
   * "circle" (radius) then this is the template.
   * @param {number} row
   * @param {number} col
   * @return {{x: number; y: number}[]}
   * @protected
   */
  _getBaseArea(row, col) {
    if (!canvas?.ready) return [];
    if (this.document.parent.grid.type === CONST.GRID_TYPES.SQUARE)
      return this._getBaseAreaSquare(row, col).map(([x, y]) => ({ x, y }));
    if (
      [
        CONST.GRID_TYPES.HEXODDR,
        CONST.GRID_TYPES.HEXEVENR,
        CONST.GRID_TYPES.HEXODDQ,
        CONST.GRID_TYPES.HEXEVENQ,
      ].includes(this.document.parent.grid.type)
    )
      return this._getBaseAreaHex(row, col).map(([x, y]) => ({ x, y }));
  }

  /**
   * @param {number} row
   * @param {number} col
   * @return {[x: number, y: number][]}
   * @protected
   */
  _getBaseAreaSquare(row, col) {
    const grid = canvas.grid.grid;
    const spaces = [];
    const d = this._getRadiusInSpaces();
    const o = grid.getPixelsFromGridPosition(row, col);
    for (let i = -d; i <= d; ++i) {
      for (let j = -d; j <= d; ++j) {
        const ray = Ray.fromArrays(
          grid.getPixelsFromGridPosition(row + i, col + j),
          o
        );
        if (
          grid.measureDistances([{ ray }], { gridSpaces: true }) /
            this.document.parent.grid.distance <=
          d
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
    const grid = canvas.grid.grid;
    const cube = grid.offsetToCube({ row, col });

    const cubes = [];
    const d = this._getRadiusInSpaces();
    for (let i = -d; i <= d; ++i) {
      for (let j = Math.max(-d, -i - d); j <= Math.min(d, -i + d); ++j) {
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
