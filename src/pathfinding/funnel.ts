import { Vector2 } from "three";

function triarea2(a: Vector2, b: Vector2, c: Vector2) {
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function funnelPathSmoothing(
  path: Vector2[],
  portals: { left: Vector2; right: Vector2 }[]
): Vector2[] {
  const smoothedPath: Vector2[] = [];

  let portalApex = path[0];
  let portalLeft = portals[0].left;
  let portalRight = portals[0].right;

  let apexIndex = 0;
  let leftIndex = 0;
  let rightIndex = 0;

  // Add a portal at the end of the path.
  portals.push({ left: path[path.length - 1], right: path[path.length - 1] });

  for (let i = 1; i < portals.length; i++) {
    const left = portals[i].left;
    const right = portals[i].right;

    // Update right vertex.
    if (triarea2(portalApex, portalRight, right) <= 0.0) {
      if (
        portalApex.equals(portalRight) ||
        triarea2(portalApex, portalLeft, right) > 0.0
      ) {
        // Tighten the funnel.
        portalRight = right;
        rightIndex = i;
      } else {
        // Right over left, insert left to path and restart scan from portal left point.
        smoothedPath.push(portalLeft);

        // Make current left the new apex.
        portalApex = portalLeft;
        apexIndex = leftIndex;

        // Reset portal
        portalLeft = portalApex;
        portalRight = portalApex;
        leftIndex = apexIndex;
        rightIndex = apexIndex;

        // Restart scan
        i = apexIndex;
        continue;
      }
    }

    // Update left vertex.
    if (triarea2(portalApex, portalLeft, left) >= 0.0) {
      if (
        portalApex.equals(portalLeft) ||
        triarea2(portalApex, portalRight, left) < 0.0
      ) {
        // Tighten the funnel.
        portalLeft = left;
        leftIndex = i;
      } else {
        // Left over right, insert right to path and restart scan from portal right point.
        smoothedPath.push(portalRight);

        // Make current right the new apex.
        portalApex = portalRight;
        apexIndex = rightIndex;

        // Reset portal
        portalLeft = portalApex;
        portalRight = portalApex;
        leftIndex = apexIndex;
        rightIndex = apexIndex;

        // Restart scan
        i = apexIndex;
        continue;
      }
    }
  }

  return smoothedPath;
}
