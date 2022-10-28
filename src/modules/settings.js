function canChangeAngle() {
  switch (game.system.id) {
    case "pf2e":
      // pf2e manages this aggressively, so let it I guess
      return false;
  }
  return true;
}

export function registerSettings() {
  /** @type number */
  const angle_default = CONFIG.MeasuredTemplate.defaults.angle;

  game.settings.register("grid-aware-templates", "enableSquare", {
    name: "grid-aware-templates.enableSquare.name",
    hint: "grid-aware-templates.enableSquare.hint",
    scope: "world",
    // This doesn't even work on pf2e now that I use libWrapper
    config: game.system.id !== "pf2e",
    type: Boolean,
    default: true,
  });

  game.settings.register("grid-aware-templates", "enableHex", {
    name: "grid-aware-templates.enableHex.name",
    hint: "grid-aware-templates.enableHex.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  // Allow changing the angle
  if (canChangeAngle()) {
    game.settings.register("grid-aware-templates", "angleValue", {
      name: "grid-aware-templates.angleValue.name",
      hint: "grid-aware-templates.angleValue.hint",
      scope: "world",
      config: true,
      type: Number,
      /** @param v {number} */
      onChange: v => (CONFIG.MeasuredTemplate.defaults.angle = v),
      default: angle_default,
    });
    CONFIG.MeasuredTemplate.defaults.angle = game.settings.get(
      "grid-aware-templates",
      "angleValue"
    );
  }
}
