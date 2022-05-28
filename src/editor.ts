import { Episode, waitUntil } from './common';
import { readPAKFile, writePAKFile } from './file';
import * as sprites from './sprites';

const TILES_HORIZONTAL = 50;
const TILES_VERTICAL = 36;
const SELECTOR_TILES_HORIZONTAL = 6;
const SELECTOR_TILES_VERTICAL = 27;
const UI_WIDTH = 16 * SELECTOR_TILES_HORIZONTAL + 16 * TILES_HORIZONTAL;  // selector + map
const UI_HEIGHT = 16 * TILES_VERTICAL + 24; // map + stats

export class Editor {
    // edit
    private selectedTile = 0x30;
    private hoverX = 0;    // <6 - selector
    private hoverY = 0;    // <36 - map
    private dragging = false;
    // data
    private fileName = 'map.pak';
    private readonly dataHeader = new Uint8Array([0x30, 0x30, 0x20]);
    private readonly mapData = new Uint8Array(TILES_HORIZONTAL * TILES_VERTICAL);
    // render
    private episode = Episode.Amazone;
    private readonly context: CanvasRenderingContext2D;

    constructor(private readonly canvas: HTMLCanvasElement, private readonly info: HTMLDivElement) {
        this.canvas.width = UI_WIDTH;
        this.canvas.height = UI_HEIGHT;
        this.context = this.canvas.getContext('2d')!;
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvas.addEventListener('mousedown', () => this.dragging = true);
        this.canvas.addEventListener('mouseup', () => this.dragging = false);
        this.canvas.addEventListener('mouseleave', () => this.dragging = false);
        this.canvas.addEventListener('click', () => {
            if (this.hoverX < SELECTOR_TILES_HORIZONTAL && this.hoverY < SELECTOR_TILES_VERTICAL) {
                this.selectedTile = 0x30 + this.hoverX * 0x24 + this.hoverY;
            } else if (this.hoverX >= SELECTOR_TILES_HORIZONTAL) {
                this.mapData[this.hoverX - SELECTOR_TILES_HORIZONTAL + this.hoverY * TILES_HORIZONTAL] = this.selectedTile;
            }
        })

        this.mapData.fill(0x30);
        waitUntil(() => sprites.fullyLoaded).then(this.redraw.bind(this));

        info.style.position = 'absolute';
        info.style.marginTop = '-26px';
        info.style.left = '100px';
    }
    public setEpisode(episode: Episode) {
        this.episode = episode;
        this.redraw();
    }
    public async importFile(file: File) {
        this.fileName = file.name;
        const buffer = await readPAKFile(file);
        if (buffer) {
            this.mapData.set(buffer.slice(3));
            this.dataHeader.set(buffer.slice(0, 3));
        }
        this.redraw();
    }
    public exportFile() {
        const buffer = new Uint8Array(this.dataHeader.length + this.mapData.length);
        buffer.set(this.dataHeader);
        buffer.set(this.mapData, 3);
        writePAKFile(buffer, this.fileName);
    }
    private mouseMove(ev: MouseEvent) {
        const wasAtX = this.hoverX;
        const wasAtY = this.hoverY;
        this.hoverX = Math.floor(ev.clientX / sprites.TILE_WIDTH);
        this.hoverY = Math.floor(ev.clientY / sprites.TILE_HEIGHT);
        if (wasAtX !== this.hoverX || wasAtY !== this.hoverY) {
            this.redraw();
        }
        if (this.dragging && this.hoverX >= SELECTOR_TILES_HORIZONTAL) {
            this.mapData[this.hoverX - SELECTOR_TILES_HORIZONTAL + this.hoverY * TILES_HORIZONTAL] = this.selectedTile;
        }
    }
    private drawSelector() {
        this.context.save();
        this.context.fillStyle = '#222';
        this.context.fillRect(0, 0, 16 * 6, UI_HEIGHT);
        this.context.restore();
        this.context.drawImage(sprites.sheetFull[this.episode], 0, 0);

        const x = Math.floor((this.selectedTile - 0x30) / 0x24);
        const y = (this.selectedTile - 0x30) % 0x24;
        this.context.save();
        this.context.strokeStyle = '#ffffffff';
        this.context.strokeRect(x * sprites.TILE_WIDTH, y * sprites.TILE_HEIGHT, sprites.TILE_WIDTH, sprites.TILE_HEIGHT);
        this.context.restore();
    }
    private drawMap() {
        const background = sprites.backgrounds[this.episode];
        if (!background) return;
        this.context.drawImage(background, SELECTOR_TILES_HORIZONTAL * sprites.TILE_WIDTH, 0);
        const sheet = sprites.sheets[this.episode];
        for (let y = 0; y < TILES_VERTICAL; y++) {
            for (let x = 0; x < TILES_HORIZONTAL; x++) {
                const isHoveredTile = this.hoverX - SELECTOR_TILES_HORIZONTAL === x && this.hoverY === y;
                const tileIndex = isHoveredTile ? this.selectedTile : this.mapData[y * TILES_HORIZONTAL + x];
                const tile = sheet.get(tileIndex || 0x30) || sprites.unknown_tile;
                this.context.drawImage(tile, (SELECTOR_TILES_HORIZONTAL + x) * sprites.TILE_WIDTH, y * sprites.TILE_HEIGHT);
            }
        }
    }
    private drawHover() {
        if (this.hoverX < 0 || this.hoverX >= SELECTOR_TILES_HORIZONTAL + TILES_HORIZONTAL || this.hoverY < 0 || this.hoverY >= TILES_VERTICAL) {
            return;
        }
        this.context.save();
        this.context.fillStyle = '#ffffff3f';
        this.context.fillRect(this.hoverX * sprites.TILE_WIDTH, this.hoverY * sprites.TILE_HEIGHT, sprites.TILE_WIDTH, sprites.TILE_HEIGHT);
        this.context.restore();
    }
    private setInfo() {
        this.info.innerHTML = `<b>Hover:&nbsp;</b><span>X: ${Math.max(0, this.hoverX- SELECTOR_TILES_HORIZONTAL)}, Y: ${Math.min(this.hoverY, TILES_VERTICAL)}, Tile: ${this.mapData[this.hoverX - SELECTOR_TILES_HORIZONTAL + this.hoverY * TILES_HORIZONTAL]?.toString(16).padStart(2, '0')}</span>`;
    }
    private redraw() {
        this.context.clearRect(0, 0, UI_WIDTH, UI_HEIGHT);
        this.drawMap();
        this.drawSelector();
        this.drawHover();
        this.setInfo();
    }
}