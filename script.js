function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const prefix = name + "=";
  const parts = document.cookie
    .split(';')
    .map(c => c.trim());
  for (let part of parts) {
    if (part.startsWith(prefix)) {
      return part.substring(prefix.length);
    }
  }
  return "";
}

function deleteAllCookies() {
  document.cookie.split(";").forEach(c => {
    const eq = c.indexOf("=");
    const key = eq > -1 ? c.slice(0, eq).trim() : c.trim();
    document.cookie =
      key +
      "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
}

const MAX_STAGE = 8;
const THIRST_MS = 2000;
const MAX_FLOWERS = 50;
const MAX_FLOWER_SIZE = 120;
const FLOWER_GROWTH = 1;


const GROWTH_INTERVAL = 5000;
const SPAWN_INTERVAL = 5000;

const PETAL_STAGES = [3, 6, 9, 12, 15, 18, 21, 25, 30, 35, 40, 45, 50];
const STARTING_PETALS = [3, 6];

const FLOWER_COLORS = [
  ['#E1DFE4', '#FCACE1', '#FFB8DA'],
  ['#FFB8DA', '#FAA28C', '#D4ED6B'],
  ['#FCACE1', '#E1DFE4', '#2666FB'],
  ['#D4ED6B', '#FFB8DA', '#FCACE1'],
  ['#E4E4DB', '#FAA28C', '#FCACE1'],
  ['#FAA28C', '#FFB8DA', '#2666FB'],
  ['#2666FB', '#FCACE1', '#E1DFE4'],
  ['#FFB8DA', '#D4ED6B', '#E4E4DB'],
  ['#E1DFE4', '#D4ED6B', '#FAA28C'],
  ['#FCACE1', '#FAA28C', '#E4E4DB'],
  ['#D4ED6B', '#2666FB', '#FFB8DA'],
  ['#E4E4DB', '#FCACE1', '#D4ED6B'],
];

const PETAL_MASKS = {
  3: {
    g: '/46.41% 46.41% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat',
    mask: '100% 50% var(--g),25% 93.301% var(--g),25% 6.699% var(--g),radial-gradient(100% 100%,#000 13.397%,#0000 calc(13.397% + 1px))'
  },
  6: {
    g: '/30% 30% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat',
    mask: '100% 50% var(--g),75% 93.301% var(--g),25% 93.301% var(--g),0% 50% var(--g),25% 6.699% var(--g),75% 6.699% var(--g),radial-gradient(100% 100%,#000 20%,#0000 calc(20% + 1px))'
  },
  9: {
    g: '/25.486% 25.486% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat',
    mask: '100% 50% var(--g),88.302% 82.139% var(--g),58.682% 99.24% var(--g),25% 93.301% var(--g),3.015% 67.101% var(--g),3.015% 32.899% var(--g),25% 6.699% var(--g),58.682% 0.76% var(--g),88.302% 17.861% var(--g),radial-gradient(100% 100%,#000 35.01%,#0000 calc(35.01% + 1px))'
  },
  25: {
    g: '/11.138% 11.138% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat',
    mask: '100% 50% var(--g),98.429% 62.434% var(--g),93.815% 74.088% var(--g),86.448% 84.227% var(--g),76.791% 92.216% var(--g),65.451% 97.553% var(--g),53.14% 99.901% var(--g),40.631% 99.114% var(--g),28.711% 95.241% var(--g),18.129% 88.526% var(--g),9.549% 79.389% var(--g),3.511% 68.406% var(--g),0.394% 56.267% var(--g),0.394% 43.733% var(--g),3.511% 31.594% var(--g),9.549% 20.611% var(--g),18.129% 11.474% var(--g),28.711% 4.759% var(--g),40.631% 0.886% var(--g),53.14% 0.099% var(--g),65.451% 2.447% var(--g),76.791% 7.784% var(--g),86.448% 15.773% var(--g),93.815% 25.912% var(--g),98.429% 37.566% var(--g),radial-gradient(100% 100%,#000 44.081%,#0000 calc(44.081% + 1px))'
  },
  50: {
    g: '/6% 6% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat',
    mask: '100% 50% var(--g),99.606% 56.267% var(--g),98.429% 62.434% var(--g),96.489% 68.406% var(--g),93.815% 74.088% var(--g),90.451% 79.389% var(--g),86.448% 84.227% var(--g),81.871% 88.526% var(--g),76.791% 92.216% var(--g),71.289% 95.241% var(--g),65.451% 97.553% var(--g),59.369% 99.114% var(--g),53.14% 99.901% var(--g),46.86% 99.901% var(--g),40.631% 99.114% var(--g),34.549% 97.553% var(--g),28.711% 95.241% var(--g),23.209% 92.216% var(--g),18.129% 88.526% var(--g),13.552% 84.227% var(--g),9.549% 79.389% var(--g),6.185% 74.088% var(--g),3.511% 68.406% var(--g),1.571% 62.434% var(--g),0.394% 56.267% var(--g),0% 50% var(--g),0.394% 43.733% var(--g),1.571% 37.566% var(--g),3.511% 31.594% var(--g),6.185% 25.912% var(--g),9.549% 20.611% var(--g),13.552% 15.773% var(--g),18.129% 11.474% var(--g),23.209% 7.784% var(--g),28.711% 4.759% var(--g),34.549% 2.447% var(--g),40.631% 0.886% var(--g),46.86% 0.099% var(--g),53.14% 0.099% var(--g),59.369% 0.886% var(--g),65.451% 2.447% var(--g),71.289% 4.759% var(--g),76.791% 7.784% var(--g),81.871% 11.474% var(--g),86.448% 15.773% var(--g),90.451% 20.611% var(--g),93.815% 25.912% var(--g),96.489% 31.594% var(--g),98.429% 37.566% var(--g),99.606% 43.733% var(--g),radial-gradient(100% 100%,#000 47%,#0000 calc(47% + 1px))'
  }
};

function generateFlowerMask(petalCount) {
  if (PETAL_MASKS[petalCount]) {
    return PETAL_MASKS[petalCount];
  }

  const petalSize = Math.max(5, 50 / petalCount * 2.5);
  const positions = [];

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * 2 * Math.PI;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    positions.push(`${x.toFixed(3)}% ${y.toFixed(3)}% var(--g)`);
  }

  const centerSize = Math.min(47, 10 + petalCount * 0.8);

  return {
    g: `/${petalSize.toFixed(3)}% ${petalSize.toFixed(3)}% radial-gradient(#000 calc(71% - 1px),#0000 71%) no-repeat`,
    mask: positions.join(',') + `,radial-gradient(100% 100%,#000 ${centerSize}%,#0000 calc(${centerSize}% + 1px))`
  };
}

function getNextPetalStage(currentPetals) {
  for (let i = 0; i < PETAL_STAGES.length; i++) {
    if (PETAL_STAGES[i] > currentPetals) {
      return PETAL_STAGES[i];
    }
  }
  return PETAL_STAGES[PETAL_STAGES.length - 1];
}

function applyFlowerMask(flowerHead, petalCount) {
  const maskData = generateFlowerMask(petalCount);
  flowerHead.style.setProperty('--g', maskData.g);
  flowerHead.style.mask = maskData.mask;
  flowerHead.style.webkitMask = maskData.mask;
}

function loadState(plantName) {
  let sizeStage = parseInt(getCookie(plantName + "_size")) || 0;
  let last = parseInt(getCookie(plantName + "_watered")) || 0;
  return { sizeStage, last };
}

function saveState(plantName, sizeStage) {
  setCookie(plantName + "_size", sizeStage, 365);
  setCookie(plantName + "_watered", Date.now(), 365);
}

function updatePlant(elt) {
  const name = elt.dataset.name;
  let { sizeStage, last } = loadState(name);
  const now = Date.now();

  if (now - last > THIRST_MS) {
    sizeStage = 0;
    setCookie(name + "_size", 0, 365);
  }

  const sizeV = 10 + sizeStage * 5;      // 10vmin → 50vmin
  const hueV = (120 + sizeStage * 20) % 360;
  elt.style.setProperty("--size", sizeV + "vmin");
  elt.style.setProperty("--hue", hueV);
}

function loadFlowers() {
  const data = getCookie("flowers_data");
  if (!data) return [];
  try {
    return JSON.parse(decodeURIComponent(data));
  } catch {
    return [];
  }
}

function saveFlowers(flowers) {
  setCookie("flowers_data", encodeURIComponent(JSON.stringify(flowers)), 365);
}

function createFlowerElement(flower, animate = false) {
  const garden = document.getElementById("garden");

  const container = document.createElement("div");
  container.className = "flower-container";
  container.dataset.id = flower.id;
  container.style.setProperty("--x", flower.x + "%");
  container.style.setProperty("--y", flower.y + "%");

  const stem = document.createElement("div");
  stem.className = "stem";

  const flowerHead = document.createElement("div");
  flowerHead.className = "flower";
  flowerHead.style.setProperty("--rotation", flower.rotation + "deg");

  if (flower.colorIndex !== undefined && FLOWER_COLORS[flower.colorIndex]) {
    const colors = FLOWER_COLORS[flower.colorIndex];
    flowerHead.style.setProperty("--color-center", colors[0]);
    flowerHead.style.setProperty("--color-mid", colors[1]);
    flowerHead.style.setProperty("--color-edge", colors[2]);
  } else {
    flowerHead.style.setProperty("--hue", flower.hue || 330);
  }

  const petals = flower.petals || STARTING_PETALS[0];
  applyFlowerMask(flowerHead, petals);

  container.appendChild(stem);
  container.appendChild(flowerHead);
  garden.appendChild(container);

  if (animate) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        stem.style.setProperty("--stem-height", "100%");

        setTimeout(() => {
          flowerHead.style.setProperty("--size", flower.size + "px");
          flowerHead.classList.add("grown");
        }, 600);
      });
    });
  } else {
    stem.style.setProperty("--stem-height", "100%");
    flowerHead.style.setProperty("--size", flower.size + "px");
    flowerHead.classList.add("grown");
  }

  return container;
}

function spawnFlower(animate = true) {
  const flowers = loadFlowers();
  if (flowers.length >= MAX_FLOWERS) return;

  const startingPetals = STARTING_PETALS[Math.floor(Math.random() * STARTING_PETALS.length)];

  const colorIndex = Math.floor(Math.random() * FLOWER_COLORS.length);

  const newFlower = {
    id: Date.now() + Math.random(),
    x: 5 + Math.random() * 90,
    y: 15 + Math.random() * 60,
    colorIndex: colorIndex,
    rotation: Math.random() * 360,
    size: 50 + Math.random() * 50,
    petals: startingPetals
  };

  flowers.push(newFlower);
  saveFlowers(flowers);
  createFlowerElement(newFlower, animate);
}

function renderAllFlowers() {
  document.querySelectorAll(".flower-container").forEach(el => el.remove());

  const flowers = loadFlowers();
  flowers.forEach(flower => createFlowerElement(flower, false));
}

function growExistingFlowers() {
  const flowers = loadFlowers();
  if (flowers.length === 0) return;

  let anyChanged = false;

  flowers.forEach(flowerData => {
    let newSize = flowerData.size;
    let newPetals = flowerData.petals || STARTING_PETALS[0];

    if (flowerData.size < MAX_FLOWER_SIZE) {
      newSize = Math.min(flowerData.size + FLOWER_GROWTH, MAX_FLOWER_SIZE);
      anyChanged = true;
    }

    const nextPetalStage = getNextPetalStage(newPetals);
    const petalsChanged = nextPetalStage !== newPetals;

    flowerData.size = newSize;
    flowerData.petals = nextPetalStage;

    const container = document.querySelector(`.flower-container[data-id="${flowerData.id}"]`);
    if (container) {
      const flowerHead = container.querySelector(".flower");

      if (flowerHead) {
        flowerHead.style.setProperty("--size", flowerData.size + "px");

        if (petalsChanged) {
          const ghost = flowerHead.cloneNode(true);
          const computedStyle = window.getComputedStyle(flowerHead);
          ghost.style.width = computedStyle.width;
          ghost.style.height = computedStyle.height;

          ghost.classList.add('flower-ghost');
          ghost.classList.remove('flower');

          container.appendChild(ghost);

          applyFlowerMask(flowerHead, flowerData.petals);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              ghost.classList.add('fading-out');
            });
          });

          setTimeout(() => {
            ghost.remove();
          }, 2000);
        } else {
          applyFlowerMask(flowerHead, flowerData.petals);
        }
      }
    }
  });

  if (anyChanged) {
    saveFlowers(flowers);
  }
}

function resetGarden() {
  deleteAllCookies();
  document.querySelectorAll(".plant").forEach(updatePlant);
  document.querySelectorAll(".flower-container").forEach(el => el.remove());
}

let growthInterval = null;
let spawnInterval = null;

function startAutoGrowth() {
  growthInterval = setInterval(() => {
    growExistingFlowers();
  }, GROWTH_INTERVAL);

  spawnInterval = setInterval(() => {
    spawnFlower(true);
  }, SPAWN_INTERVAL);
}

function stopAutoGrowth() {
  if (growthInterval) clearInterval(growthInterval);
  if (spawnInterval) clearInterval(spawnInterval);
}

window.addEventListener("load", () => {
  document.querySelectorAll(".plant").forEach(updatePlant);
  renderAllFlowers();

  startAutoGrowth();

  const flowers = loadFlowers();
  if (flowers.length === 0) {
    spawnFlower(true);
  }

  document.getElementById("resetBtn")
    .addEventListener("click", () => {
      resetGarden();
      setTimeout(() => spawnFlower(true), 500);
    });
});

window.addEventListener("beforeunload", () => {
  stopAutoGrowth();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoGrowth();
  } else {
    startAutoGrowth();
  }
});