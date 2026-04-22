function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function randItem(arr) {
  return arr[randInt(0, arr.length)];
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

function randomConic() {
  const angle = randInt(0, 360);
  return `conic-gradient(from ${angle}deg at 50% 50%, ${generateStops(3 + randInt(0, 3))})`;
}

export function randomGradient() {
  const generators = [randomLinear, randomRadial, randomConic];
  return randItem(generators)();
}