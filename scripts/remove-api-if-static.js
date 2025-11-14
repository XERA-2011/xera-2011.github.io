const fs = require("fs");
const path = require("path");

const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

if (isStatic) {
  const apiDir = path.join(__dirname, "../src/app/api");

  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
    console.log("Removed API folder for static export.");
  } else {
    console.log("API folder not found, skipping.");
  }
}
