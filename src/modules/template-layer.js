
/**
 * @this {TemplateLayer}
 * @param {(event: PIXI.InteractionEvent) => Promise<void>} wrapped
 * @param {PIXI.InteractionEvent} event
 */
export function GAOnDragLeftStart(wrapped, event) {
  if (
    (canvas.grid.isHex &&
      game.settings.get("grid-aware-temlates", "enableHex")) ||
    (canvas.grid.type === CONST.GRID_TYPES.SQUARE &&
      game.settings.get("grid-aware-templates", "enableSquare"))
  ) {
    [event.data.origin.x, event.data.origin.y] = canvas.grid.getCenter(
      event.data.origin.x,
      event.data.origin.y
    );
  }
  return wrapped(event);
}

/**
 * @this {TemplateLayer}
 * @param {(event: PIXI.InteractionEvent) => void} wrapped
 * @param {PIXI.InteractionEvent} event
 * @override
 */
export function GAOnDragLeftMove(wrapped, event) {
  if (
    !(
      canvas.grid.isHex &&
      game.settings.get("grid-aware-templates", "enableHex")
    ) ||
    !(
      canvas.grid.type === CONST.GRID_TYPES.SQUARE &&
      game.settings.get("gris-aware-templates", "enableSquare")
    )
  ) {
    return wrapped(event);
  }
  const { destination, createState, preview, origin } = event.data;
  if (createState === 0) return;

  // Snap the destination to the grid
  event.data.destination = canvas.grid.getSnappedPosition(
    destination.x,
    destination.y,
    this.gridPrecision
  );

  // Compute the ray
  const ray = new Ray(origin, destination);
  const ratio = canvas.dimensions.size / canvas.dimensions.distance;

  // Update the preview object
  // Snap the angle
  const angle_snap =
    canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ||
    ["rect", "ray"].includes(preview.document.t)
      ? undefined
      : game.settings.get("grid-aware-templates", "coarseAngleSnap")
      ? canvas.grid.isHex
        ? 30
        : 45
      : 15;
  const direction = Math.normalizeDegrees(Math.toDegrees(ray.angle));
  if (angle_snap) direction = Math.round(direction / angle_snap) * angle_snap;
  preview.document.direction = direction;
  // Snap the distance
  const distance = Math.max(ray.distance / ratio, canvas.dimensions.distance);
  preview.document.distance =
    Math.round(distance / canvas.dimensions.distance) *
    canvas.dimensions.distance;
  preview.refresh();

  // Confirm the creation state
  event.data.createState = 2;
}
