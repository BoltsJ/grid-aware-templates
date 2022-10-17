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

  // Allow changing the angle
  if (canChangeAngle()) {
    game.settings.register("grid-aware-templates", "angleValue", {
      name: "grid-aware-templates.angleValue.name",
      hint: "grid-aware-templates.angleValue.hint",
      scope: "world",
      config: true,
      onChange: v => (CONFIG.MeasuredTemplate.defaults.angle = v),
      default: angle_default,
    });
    CONFIG.MeasuredTemplate.defaults.angle = game.settings.get(
      "grid-aware-templates",
      "angleValue"
    );
  }
}
