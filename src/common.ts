export function createCanvas(w: number, h: number, data?: ImageData) {
    const element = document.createElement('canvas');
    element.width = w;
    element.height = h;
    if (data) {
        element.getContext('2d')!.putImageData(data, 0, 0);
    }
    return element;
}

export function cropCanvas(original: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number) {
    const data = original.getContext('2d')!.getImageData(sx, sy, sw, sh);
    return createCanvas(sw, sh, data);
}

export const enum Episode {
    Amazone = 1,
    Construction,
    Antartica,
    Vegas,
    Circus,
}

export const episodeNames = ['', 'Amazone', 'Construction', 'Antartica', 'Vegas', 'Circus'];

export async function waitUntil(canBreak: () => boolean) {
    return new Promise<void>(res => {
        const intv = setInterval(() => {
            if (canBreak()) {
                res();
                clearInterval(intv);
            }
        }, 200);
    });
}