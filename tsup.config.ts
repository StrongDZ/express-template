import { defineConfig } from "tsup";
import { readdirSync, statSync, existsSync, copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const isProduction = process.env.NODE_ENV === "production";

// Hàm helper để tìm tất cả file và tạo entry object giữ nguyên cấu trúc
function getEntryPoints(dir: string, prefix: string = ""): Record<string, string> {
    const entries: Record<string, string> = {};
    
    // Kiểm tra thư mục có tồn tại không
    if (!existsSync(dir)) {
        return entries;
    }
    
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            const newPrefix = prefix ? `${prefix}/${file}` : file;
            Object.assign(entries, getEntryPoints(fullPath, newPrefix));
        } else if (file.endsWith(".ts")) {
            // Chỉ thêm file .ts vào entry (tsup sẽ build)
            const entryKey = prefix ? `${prefix}/${file.replace(/\.ts$/, "")}` : file.replace(/\.ts$/, "");
            entries[entryKey] = fullPath;
        }
    }

    return entries;
}

// Hàm helper để copy file .json vào build
function copyJsonFiles(dir: string, prefix: string = "", outDir: string = "build") {
    if (!existsSync(dir)) {
        return;
    }
    
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            const newPrefix = prefix ? `${prefix}/${file}` : file;
            copyJsonFiles(fullPath, newPrefix, outDir);
        } else if (file.endsWith(".json")) {
            // Copy file .json vào build với cấu trúc thư mục giữ nguyên
            const destPath = prefix ? join(outDir, prefix, file) : join(outDir, file);
            const destDir = dirname(destPath);
            
            // Tạo thư mục nếu chưa tồn tại
            if (!existsSync(destDir)) {
                mkdirSync(destDir, { recursive: true });
            }
            
            copyFileSync(fullPath, destPath);
        }
    }
}

export default defineConfig({
    // Sử dụng entry object để giữ nguyên cấu trúc thư mục
    entry: {
        ...getEntryPoints("src", "src"),
        ...(existsSync("sdk") ? getEntryPoints("sdk", "sdk") : {}),
        ...(existsSync("swagger") ? getEntryPoints("swagger", "swagger") : {}),
    },
    format: ["cjs"],
    target: "node18",
    outDir: "build",

    // Logic tự động dựa trên NODE_ENV
    sourcemap: !isProduction, // Dev thì có map, Prod thì không
    minify: isProduction, // Prod thì nén, Dev thì để nguyên đọc cho dễ

    clean: false,
    splitting: false,

    // ⚠️ LƯU Ý VỀ BUNDLE:
    // Vì bạn đang để bundle: false (giữ nguyên cấu trúc file),
    // nên các option như 'treeshake', 'external', 'noExternal' sẽ KHÔNG CÓ TÁC DỤNG.
    // Tsup sẽ chỉ dịch TS -> JS và giữ nguyên import.
    bundle: false,

    tsconfig: "tsconfig.json",
    dts: false,
    
    // Copy file .json sau khi build xong
    onSuccess: async () => {
        // Copy file .json từ swagger vào build
        if (existsSync("swagger")) {
            copyJsonFiles("swagger", "swagger", "build");
        }
        // Copy file .json từ sdk nếu có
        if (existsSync("sdk")) {
            copyJsonFiles("sdk", "sdk", "build");
        }
        // Copy file .json từ src nếu có
        if (existsSync("src")) {
            copyJsonFiles("src", "src", "build");
        }
    },
});
