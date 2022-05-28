import { episodeNames } from "./common";
import { Editor } from "./editor";

document.body.style.margin = '0';
document.documentElement.style.backgroundColor = '#333';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const infoElement = document.createElement('div');
document.body.appendChild(infoElement);
const editor = new Editor(canvas, infoElement);

const toolbar = document.createElement('div');
document.body.appendChild(toolbar);

const epSelect = document.createElement('select');
for (let i = 1; i <= 5; i++) {
    const option = document.createElement('option');
    option.textContent = `${i} - ${episodeNames[i]}`;
    epSelect.appendChild(option);
}
epSelect.onchange = function () {
    editor.setEpisode(epSelect.selectedIndex + 1);
}
toolbar.appendChild(epSelect);

const importButton = document.createElement('button');
importButton.textContent = 'import';
importButton.onclick = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pak';
    input.click();
    input.onchange = async function () {
        const file = input.files && input.files[0];
        if (file) {
            editor.importFile(file);
        }
    };
}
toolbar.appendChild(importButton);

const exportButton = document.createElement('button');
exportButton.textContent = 'export';
exportButton.onclick = () => editor.exportFile();
toolbar.appendChild(exportButton);

