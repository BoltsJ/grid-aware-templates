import { GAMeasuredTemplate } from "./modules/placeable-object";

Hooks.once("init", () => {
  console.log("grid-aware-templates | Initializing module");

  CONFIG.MeasuredTemplate.objectClass = GAMeasuredTemplate;
});
