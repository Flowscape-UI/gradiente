function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randItem(arr) {
  return arr[randInt(0, arr.length)];
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatPercent(value) {
  return `${Number(value.toFixed(2))}%`;
}

function randColor() {
  const h = randInt(0, 360);
  const s = randInt(60, 100);
  const l = randInt(40, 70);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateStops(count = 2 + randInt(0, 3)) {
  const stops = [];

  for (let i = 0; i < count; i++) {
    const color = randColor();
    const pos = i === 0 || i === count - 1
      ? ""
      : ` ${randInt(0, 100)}%`;

    stops.push(color + pos);
  }

  return stops.join(", ");
}

function randomLinear() {
  const angle = randInt(0, 360);
  return `linear-gradient(${angle}deg, ${generateStops()})`;
}

function randomRadial() {
  const x = randInt(0, 100);
  const y = randInt(0, 100);
  return `radial-gradient(circle at ${x}% ${y}%, ${generateStops()})`;
}

function randomDiamond() {
  const x = randInt(15, 85);
  const y = randInt(15, 85);
  return `diamond-gradient(circle at ${x}% ${y}%, ${generateStops(3 + randInt(0, 3))})`;
}

function randomConic() {
  const angle = randInt(0, 360);
  return `conic-gradient(from ${angle}deg at 50% 50%, ${generateStops(3 + randInt(0, 3))})`;
}


const meshPalettes = [
  // Aurora
  ["#ff5c8a", "#ffb703", "#c084fc", "#6366f1", "#60a5fa", "#ffe29a", "#f472b6", "#34d399", "#7dd3fc", "#1d4ed8"],

  // Instagram-like
  ["#833ab4", "#fd1d1d", "#fcb045", "#405de6", "#ffdc80", "#e1306c", "#5851db", "#c13584", "#f77737"],

  // Ocean
  ["#0ea5e9", "#38bdf8", "#2563eb", "#14b8a6", "#ccfbf1", "#06b6d4", "#22c55e", "#2dd4bf", "#0891b2"],

  // Neon
  ["#0f172a", "#7c3aed", "#ec4899", "#2563eb", "#67e8f9", "#f472b6", "#06b6d4", "#9333ea", "#312e81"],

  // Candy
  ["#ff00aa", "#faff00", "#00ff7f", "#00c2ff", "#7c00ff", "#ff4fd8", "#fff7cc", "#00f0ff", "#0066ff"],
];

function randFrom(items) {
  return items[randInt(0, items.length - 1)];
}

function randomMeshColor(palette) {
  // 80% из палитры, 20% полностью случайный цвет
  if (Math.random() < 0.8) {
    return randFrom(palette);
  }

  return randColor();
}

function makeVertexId(x, y) {
  return `v${x}${y}`;
}

function makePatchId(x, y) {
  return `p${x}${y}`;
}

function randomMesh() {
  const size = randFrom([3, 3, 4, 4, 5]); // 3/4 чаще, 5 иногда
  const rows = size;
  const columns = size;

  const method = Math.random() < 0.85 ? "bicubic" : "bilinear";
  const colorSpace = randFrom(["oklab", "oklch", "srgb"]);
  const palette = randFrom(meshPalettes);

  const parts = [];

  parts.push("mesh-gradient(");
  parts.push(`grid ${rows} ${columns} method ${method} in ${colorSpace}, `);

  // vertices
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const baseX = (x / (columns - 1)) * 100;
      const baseY = (y / (rows - 1)) * 100;

      const isEdgeX = x === 0 || x === columns - 1;
      const isEdgeY = y === 0 || y === rows - 1;

      // края оставляем ближе к рамке, внутренние точки смещаем сильнее
      const jitterX = isEdgeX ? randFloat(-2, 2) : randFloat(-10, 10);
      const jitterY = isEdgeY ? randFloat(-2, 2) : randFloat(-10, 10);

      const px = clamp(baseX + jitterX, 0, 100);
      const py = clamp(baseY + jitterY, 0, 100);

      const id = makeVertexId(x, y);
      const color = randomMeshColor(palette);

      parts.push(
        `vertex ${id} ${formatPercent(px)} ${formatPercent(py)} ${color}, `,
      );
    }
  }

  // patches
  for (let y = 0; y < rows - 1; y += 1) {
    for (let x = 0; x < columns - 1; x += 1) {
      const id = makePatchId(x, y);

      const topLeft = makeVertexId(x, y);
      const topRight = makeVertexId(x + 1, y);
      const bottomRight = makeVertexId(x + 1, y + 1);
      const bottomLeft = makeVertexId(x, y + 1);

      const isLastPatch = y === rows - 2 && x === columns - 2;

      parts.push(
        `patch ${id} ${topLeft} ${topRight} ${bottomRight} ${bottomLeft}${isLastPatch ? "" : ", "}`,
      );
    }
  }

  parts.push(")");

  return parts.join("");
}

export function randomGradient() {
  const generators = [
    randomLinear,
    randomRadial,
    randomDiamond,
    randomMesh,
    randomConic
  ];
  return randItem(generators)();
}
