import { GAMeasuredTemplate } from "./modules/placeable-object";
import { GATemplateLayer } from "./modules/template-layer";
import { registerSettings } from "./modules/settings";

Hooks.once("init", () => {
  console.log("grid-aware-templates | Initializing module");

  registerSettings();

  CONFIG.MeasuredTemplate.objectClass = GAMeasuredTemplate;
  CONFIG.Canvas.layers.templates.layerClass = GATemplateLayer;
});
