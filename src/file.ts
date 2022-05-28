import { saveAs } from "file-saver";
import { waitUntil } from "./common";


export async function readPAKFile(file: File) {
    let buffer: Uint8Array | undefined;
    let invalid = false;
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.result) {
            buffer = new Uint8Array(reader.result as ArrayBuffer);
        } else {
            alert('invalid file');
            invalid = true;
        }
    }
    reader.readAsArrayBuffer(file);
    await waitUntil(() => !!buffer || invalid);
    return buffer;
}

export async function writePAKFile(buffer: Uint8Array, fileName: string) {
    const blob = new Blob([buffer], {type: "octet/stream"});
    saveAs(blob, fileName);
}