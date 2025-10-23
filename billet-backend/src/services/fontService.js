const pureimage = require("pureimage");
const fs = require("fs");
const path = require("path");

class FontService {
  static init() {
    try {
      console.log("🔤 Initializing fonts for pureimage...");

      // Register Roboto fonts
      const fontsDir = path.join(__dirname, "../../assets/fonts");

      // Register regular font
      const regularFontPath = path.join(fontsDir, "Roboto-Regular.ttf");
      if (fs.existsSync(regularFontPath)) {
        pureimage.registerFont(regularFontPath, "Roboto");
        console.log('✅ Registered Roboto-Regular.ttf as "Roboto"');
      } else {
        console.error("❌ Roboto-Regular.ttf not found at:", regularFontPath);
      }

      // Register bold font
      const boldFontPath = path.join(fontsDir, "Roboto-Bold.ttf");
      if (fs.existsSync(boldFontPath)) {
        pureimage.registerFont(boldFontPath, "Roboto-Bold");
        console.log('✅ Registered Roboto-Bold.ttf as "Roboto-Bold"');
      } else {
        console.error("❌ Roboto-Bold.ttf not found at:", boldFontPath);
      }

      console.log("🔤 Font initialization complete");
    } catch (error) {
      console.error("❌ Font initialization failed:", error);
    }
  }
}

module.exports = FontService;
