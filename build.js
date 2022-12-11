const getPixels = require("get-pixels");
const fs = require("fs");

const { toFourDigits } = require("./utilities");

const outputpath = "./frames.js";

const myArgs = process.argv.slice(2);
if (myArgs.length !== 1) {
    console.log("Please provide a number for the frame to start on");
    return;
}
const currentFrame = parseInt(myArgs[0])
// 2 fps
const frameStep = 15;

const build = (index) => {
    // Delete file if exists
    if (fs.existsSync(outputpath)) {
        fs.writeFileSync(outputpath, "", { flag: "w" }, (err) => {});
    }
    fs.writeFileSync(outputpath, "const FRAME = " + currentFrame.toString() + ";\nconst FRAMES = `Array(", { flag: "a" }, (err) => {});
    doFrame();
};


function doFrame(index = 1+currentFrame*frameStep, frameNum = currentFrame) {
    let indexString = toFourDigits(Math.round(index).toString());
    let path = `frames/BadApple${indexString}.png`;
    if(frameNum >= currentFrame + 25) {
        fs.writeFileSync(outputpath, "Array(Custom String(\"\")));`", { flag: "a" }, (err) => {});
        return;
    }

    getPixels(path, (err, pixels) => {
        if (err) {
            console.error(err);
            return;
        }

        let widthCounter = 0;
        let string = "Array(Custom String(\"";
        for (let i = 0; i < pixels.data.length; i += 4) {
            let value = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
            value = Math.max(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);

            // string += getCharacterForGrayScale(value) + getCharacterForGrayScale(value);
            const index = Math.floor(value / (256 / 2));
            if(index === 0){
                string += "1";
            } else if(index === 1) {
                string += "0";
            } else {
                throw 'index not 0 or 1';
            }

            widthCounter++;
            if (widthCounter === 32) {
                widthCounter = 0;
                string += "\"),";
                string += "Custom String(\"";
            }
        }
        string += "\")),\n";

        fs.writeFileSync(outputpath, string, { flag: "a" }, (err) => {});

        console.log(index);

        doFrame(index + frameStep, frameNum+1);
    });
}

build(1);

module.exports.build = build;
