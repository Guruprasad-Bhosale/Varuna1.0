/**
 * Largest-Triangle-Three-Buckets (LTTB) decimation algorithm.
 * 
 * Downsamples time-series data while preserving visual shape and peaks.
 * Always preserves the first and last data points of the selected time range.
 * 
 * @param data Array of [timestamp, value] tuples.
 * @param threshold Maximum number of data points to return.
 * @returns Downsampled array of [timestamp, value] tuples.
 */
export function downsampleLTTB(data: [number, number][], threshold: number): [number, number][] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) {
    return data;
  }

  const sampled: [number, number][] = [];
  let sampledIndex = 0;

  // Bucket size. Leave room for start and end data points
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle
  let maxAreaPoint: [number, number] = [0, 0];
  let maxArea: number;
  let area: number;
  let nextA: number = 0;

  sampled[sampledIndex++] = data[a]; // Always add the first point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (containing c)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * every) + 1;
    let avgRangeEnd = Math.floor((i + 2) * every) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += data[avgRangeStart][0];
      avgY += data[avgRangeStart][1];
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor((i + 0) * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    // Point a
    const pointAx = data[a][0];
    const pointAy = data[a][1];

    maxArea = -1;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      // Calculate triangle area over three buckets
      area =
        Math.abs(
          (pointAx - avgX) * (data[rangeOffs][1] - pointAy) -
          (pointAx - data[rangeOffs][0]) * (avgY - pointAy)
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[rangeOffs];
        nextA = rangeOffs;
      }
    }

    sampled[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }

  sampled[sampledIndex++] = data[dataLength - 1]; // Always add last

  return sampled;
}
