const angle_epsilon = 1;

/**
 * Extends the MeasuredTemplates to allow for templates that use grid
 * measurements to highlight instead of a shape.
 */
export class GAMeasuredTemplate extends MeasuredTemplate {
  /** @override */
  _getGridHighlightPositions() {
    if (!this.document.getFlag("grid-aware-templates", "enabled"))
      return super._getGridHighlightPositions();
    const grid = canvas.grid.grid;
    const [row, col] = grid.getGridPositionFromPixels(this.x, this.y);
    const base_area = this._getBaseArea(row, col);

    switch (this.document.t) {
      case "circle":
        return base_area;
      case "cone":
        const r0 = Ray.fromAngle(
          this.x,
          this.y,
          (this.document.direction * Math.PI) / 180,
          1
        );
        return [
          ...base_area.filter(p => {
            let r1 = Ray.fromArrays([this.x, this.y], grid.getCenter(p.x, p.y));
            const theta = Math.acos(
              Math.clamped(
                -1,
                (r0.dx * r1.dx + r0.dy * r1.dy) / (r0.distance * r1.distance),
                1
              )
            );
            return (
              theta <=
              ((this.document.angle + angle_epsilon) * Math.PI) / 180 / 2
            );
          }),
          (() => {
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
   * @return {{x: number; x: number}[]}
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
   * Compute the maximal potential area the template could highlight. For hex
   * and 1-1-1 square "circle" templates, this is the highlight.
   * @param {number} row
   * @param {number} col
   * @return {[x: number, y: number][]}
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
   * Compute the maximal potential area the template could highlight. For hex
   * and 1-1-1 square "circle" templates, this is the highlight.
   * @param {number} row
   * @param {number} col
   * @return {[x: number; y: number][]}
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

  _getRadiusInSpaces() {
    return Math.round(
      this.document.distance / this.document.parent.grid.distance
    );
  }
}
