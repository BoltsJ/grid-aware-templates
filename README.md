# Grid Aware Templates

Improves shape detection for measured templates on gridded maps. The default
algorithm in foundry checks if a grid center is within the preview shape and
highlights according to that. This approach is a poor choice for games that
rely heavily on grid spaces for measurements, leading to incorrectly
highlighted areas. 

This uses an alternative approach for highlighting spaces in circle and cone
templates. For circles, all spaces within the radius of the template, as
measured by grid spaces are highlighted. For cones, the circle area used, then
spaces that aren't within the angle of the cone are removed. These alternate
approaches give much nicer template highlighting, particularly for hexagonal
grids.

To make these changes easier to use, templates will now snap to grid space
increments for size and 15° increments for rotation during creation.
