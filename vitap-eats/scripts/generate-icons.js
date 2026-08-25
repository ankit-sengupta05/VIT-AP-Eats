const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const src = path.join(__dirname, "../public/icons/icon-source.jpg");
const outDir = path.join(__dirname, "../public/icons");

fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const size of sizes) {
    await sharp(src)
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
  console.log("All icons generated!");
})();
