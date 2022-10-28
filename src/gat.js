import { libWrapper } from "./libwrapper/shim";
import { GAGetGridHighlightPositions } from "./modules/placeable-object";
import { registerSettings } from "./modules/settings";
import { GATemplateLayer } from "./modules/template-layer";

Hooks.once("init", () => {
  console.log("grid-aware-templates | Initializing module");

  registerSettings();

  CONFIG.Canvas.layers.templates.layerClass = GATemplateLayer;
});

Hooks.once("setup", () => {
  libWrapper.register(
    "grid-aware-templates",
    "CONFIG.MeasuredTemplate.objectClass.prototype._getGridHighlightPositions",
    GAGetGridHighlightPositions,
    libWrapper.MIXED
  );
});
