import path from "path";
import fs from "fs";

// Save encrypted data to file
export function saveToFile(data: string, filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data, "utf8");
}

// Load data from file
export function loadFromFile(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, "utf8");
}