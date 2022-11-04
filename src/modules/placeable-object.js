/** @typedef {import("client/pixi/placeables/template.js").MeasuredTemplate} */
/** @typedef {object} Point @property x {number} @property y {number} */

const angle_epsilon = 1;

/**
 * @this {MeasuredTemplate}
 * @param wrapped {function(): Point[]}
 */
export function GAGetGridHighlightPositions(wrapped) {
  /** @type {BaseGrid} */
  const grid = canvas.grid.grid;

  const [row, col] = grid.getGridPositionFromPixels(this.x, this.y);
  const base_area = getBaseArea(this, row, col);
  if (
    this.document.parent.grid.type === CONST.GRID_TYPES.SQUARE &&
    !game.settings.get("grid-aware-templates", "enableSquare")
  ) {
    return wrapped();
  }
  if (
    [
      CONST.GRID_TYPES.HEXODDR,
      CONST.GRID_TYPES.HEXEVENR,
      CONST.GRID_TYPES.HEXODDQ,
      CONST.GRID_TYPES.HEXEVENQ,
    ].includes(this.document.parent.grid.type) &&
    !game.settings.get("grid-aware-templates", "enableHex")
  ) {
    return wrapped();
  }

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

  return wrapped();
}

/**
 * @this {MeasuredTemplate}
 * @param {(event: PIXI.InteractionEvent) => Promise<unknown>} wrapped
 * @param {PIXI.InteractionEvent} event
 */
export function GATemplateOnDragLeftDrop(wrapped, event) {
  if (
    !(
      canvas.grid.isHex &&
      game.settings.get("grid-aware-templates", "enableHex")
    ) &&
    !(
      canvas.grid.type === CONST.GRID_TYPES.SQUARE &&
      game.settings.get("grid-aware-templates", "enableSquare")
    )
  ) {
    return wrapped(event);
  }
  const { clones, destination, originalEvent } = event.data;
  if (!clones || !canvas.dimensions.rect.contains(destination.x, destination.y))
    return false;
  const updates = clones.map(c => {
    let dest = { x: c.document.x, y: c.document.y };
    if (!originalEvent.shiftKey) {
      dest = a2p(canvas.grid.getCenter(c.document.x, c.document.y));
    }
    return {
      _id: c._original.id,
      x: dest.x,
      y: dest.y,
      rotation: c.document.rotation,
    };
  });
  return canvas.scene.updateEmbeddedDocuments(
    this.document.documentName,
    updates
  );
}

/**
 * Convert point array to point object
 * @param {[x: number, y: number]}
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

/** @param {MeasuredTemplate} template */
function getRadiusInSpaces(template) {
  return Math.round(
    template.document.distance / template.document.parent.grid.distance
  );
}

/**
 * Compute the base radius of the template. If the template is a
 * "circle" (radius) then this is the template.
 * @param {MeasuredTemplate} template
 * @param {number} row
 * @param {number} col
 */
function getBaseArea(template, row, col) {
  if (!canvas?.ready) return [];
  if (template.document.parent.grid.type === CONST.GRID_TYPES.SQUARE)
    return getBaseAreaSquare(template, row, col).map(a2p);
  if (
    [
      CONST.GRID_TYPES.HEXODDR,
      CONST.GRID_TYPES.HEXEVENR,
      CONST.GRID_TYPES.HEXODDQ,
      CONST.GRID_TYPES.HEXEVENQ,
    ].includes(template.document.parent.grid.type)
  )
    return getBaseAreaHex(template, row, col).map(a2p);
}

/**
 * @param {MeasuredTemplate} template
 * @param {number} row
 * @param {number} col
 * @return {[x: number, y: number][]}
 */
function getBaseAreaSquare(template, row, col) {
  /** @type {SquareGrid} */
  const grid = canvas.grid.grid;
  const spaces = [];
  const r = getRadiusInSpaces(template);
  const o = grid.getPixelsFromGridPosition(row, col);
  for (let i = -r; i <= r; ++i) {
    for (let j = -r; j <= r; ++j) {
      const ray = Ray.fromArrays(
        grid.getPixelsFromGridPosition(row + i, col + j),
        o
      );
      if (
        grid.measureDistances([{ ray }], { gridSpaces: true }) /
          template.document.parent.grid.distance <=
        r
      )
        spaces.push({ row: row + i, col: col + j });
    }
  }
  return spaces.map(({ row, col }) => grid.getPixelsFromGridPosition(row, col));
}

/**
 * @param {MeasuredTemplate} template
 * @param {number} row
 * @param {number} col
 * @return {[x: number, y: number][]}
 * @protected
 */
function getBaseAreaHex(template, row, col) {
  /** @type {HexagonalGrid} */
  const grid = canvas.grid.grid;
  const cube = grid.offsetToCube({ row, col });

  /** {GridHexCubeCoordinate[]} */
  const cubes = [];
  const r = getRadiusInSpaces(template);
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
