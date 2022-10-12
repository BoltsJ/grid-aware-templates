export class GATemplateLayer extends TemplateLayer {
  /**
   * @param {PIXI.InteractionEvent} event
   * @override
   */
  async _onDragLeftStart(event) {
    // Enforce templates snapping to grid centers
    [event.data.origin.x, event.data.origin.y] = canvas.grid.getCenter(
      event.data.origin.x,
      event.data.origin.y
    );
    return super._onDragLeftStart(event);
  }

  /**
   * @param {PIXI.InteractionEvent} event
   * @override
   */
  _onDragLeftMove(event) {
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
    const angle_snap = canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? 5 : 15;
    preview.document.direction =
      Math.round(
        Math.normalizeDegrees(Math.toDegrees(ray.angle)) / angle_snap
      ) * angle_snap;
    // Snap the distance
    const distance = Math.max(ray.distance / ratio, canvas.dimensions.distance);
    preview.document.distance =
      Math.round(distance / canvas.dimensions.distance) *
      canvas.dimensions.distance;
    preview.refresh();

    // Confirm the creation state
    event.data.createState = 2;
  }
}
