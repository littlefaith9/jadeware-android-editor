import { createCanvas, cropCanvas, Episode, waitUntil } from "./common";

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

export let fullyLoaded = false;
export const sheetFull: HTMLCanvasElement[] = [];
export const sheets: Map<number, HTMLCanvasElement>[] = [];
export const fontTiny = new Map<string, HTMLCanvasElement>();
export const backgrounds: HTMLCanvasElement[] = [];
export let unknown_tile: HTMLCanvasElement;

async function loadImage(name: string) {
    const img = document.createElement('img');
    img.src = `./assets/${name}.png`;
    await waitUntil(() => img.complete);

    const imgCanvas = createCanvas(img.width, img.height);
    const imgCtx = imgCanvas.getContext('2d')!;
    imgCtx.drawImage(img, 0, 0);
    return imgCanvas;
}

async function loadSheet(episode: Episode) {
    const img = await loadImage(`sheet_${episode as number}`);
    const imgCtx = img.getContext('2d')!;

    const spriteMap = new Map<number, HTMLCanvasElement>();
    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 27; y++) {
            const index = 0x30 + x * 0x24 + y;
            const ox = x * TILE_WIDTH;
            const oy = y * TILE_HEIGHT;
            const data = imgCtx.getImageData(ox, oy, TILE_WIDTH, TILE_HEIGHT);
            const spriteCanvas = createCanvas(TILE_WIDTH, TILE_HEIGHT, data);
            spriteMap.set(index, spriteCanvas);
        }
    }

    return [img, spriteMap] as [HTMLCanvasElement, Map<number, HTMLCanvasElement>];
}

async function loadFontTiny() {
    const fontSheet = await loadImage('font_tiny');
    for (let i = 0; i < 16; i++) {
        fontTiny.set(i.toString(16), cropCanvas(fontSheet, i * 3, 0, 3, 5));
    }
    fontTiny.set('?', cropCanvas(fontSheet, 16 * 3, 0, 3, 5));
}

(async () => {
    for (let i = 1; i <= 5; i++) {
        [sheetFull[i], sheets[i]] = await loadSheet(i);
        backgrounds[i] = await loadImage(`background_${i}`);
    }
    unknown_tile = (await loadImage(`unknown_tile`));
    await loadFontTiny();
    fullyLoaded = true;
})()