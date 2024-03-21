import { libWrapper } from "./libwrapper/shim";
import {
  GAGetGridHighlightPositions,
  GATemplateOnDragLeftDrop,
} from "./modules/placeable-object";
import { registerSettings } from "./modules/settings";
import { GAOnDragLeftMove, GAOnDragLeftStart } from "./modules/template-layer";

Hooks.once("init", () => {
  console.log("grid-aware-templates | Initializing module");

  registerSettings();
});

Hooks.once("setup", () => {
  libWrapper.register(
    "grid-aware-templates",
    "CONFIG.MeasuredTemplate.objectClass.prototype._getGridHighlightPositions",
    GAGetGridHighlightPositions,
    libWrapper.MIXED
  );

  libWrapper.register(
    "grid-aware-templates",
    "CONFIG.MeasuredTemplate.objectClass.prototype._onDragLeftDrop",
    GATemplateOnDragLeftDrop,
    libWrapper.WRAPPER
  );

  libWrapper.register(
    "grid-aware-templates",
    "CONFIG.Canvas.layers.templates.layerClass.prototype._onDragLeftStart",
    GAOnDragLeftStart,
    libWrapper.WRAPPER
  );

  libWrapper.register(
    "grid-aware-templates",
    "CONFIG.Canvas.layers.templates.layerClass.prototype._onDragLeftMove",
    GAOnDragLeftMove,
    libWrapper.MIXED
  );
});
