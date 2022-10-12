import { GAMeasuredTemplate } from "./modules/placeable-object";
import { GATemplateLayer } from "./modules/template-layer";

Hooks.once("init", () => {
  console.log("grid-aware-templates | Initializing module");

  CONFIG.MeasuredTemplate.objectClass = GAMeasuredTemplate;
  CONFIG.Canvas.layers.templates.layerClass = GATemplateLayer;
});
