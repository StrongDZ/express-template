import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
    entry: ["src/**/*.ts", "sdk/**/*.ts", "swagger/**/*.json"],
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
});
