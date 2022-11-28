const ffmpeg = require("ffmpeg");
const fs = require("fs");

if (fs.existsSync("./frames")) {
    fs.rmdirSync("./frames", { recursive: true });
}

fs.mkdirSync("./frames");

try {
    ffmpeg("./Videos/badapplesync.mp4").then(
        (video) => {
            console.log("Processing Video...");
            video.setVideoSize("32x24");
            video.save("frames/BadApple%04d.png", (error, file) => {
                if (error) console.log(error);
                else console.log("Video has been processed!");
            });
        },
        (err) => {
            console.log(`Error: ${err}`);
        }
    );
} catch (e) {
    console.log(e.code);
    console.log(e.message);
}
