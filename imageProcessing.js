/*
Alnim
12/5/2017
*/
//0: DEFs
//0.1: Bsc Dimensions for the tiles
let dim = 32;
//0.2: Canvas Defs
let canvas = document.getElementById('imgData');
let ctx = canvas.getContext('2d');

function setImgOnCanvas(img) {
	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);
}

function invertImgColor() {
	//Get the image data:
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let imgData = img.data;
	for (let i = 0; i < imgData.length; i += 4) {
		imgData[i] = 255 - imgData[i];
		imgData[i + 1] = 255 - imgData[i + 1];
		imgData[i + 2] = 255 - imgData[i + 2];
	}
	ctx.putImageData(img, 0, 0);
}

function getHue(r, g, b) {

	// convert rgb values to the range of 0-1
	let h;
	r /= 255, g /= 255, b /= 255;

	// find min and max values out of r,g,b components
	let max = Math.max(r, g, b), min = Math.min(r, g, b);

	if (max == r) {
		// if red is the predominent color
		h = (g - b) / (max - min);
	}
	else if (max == g) {
		// if green is the predominent color
		h = 2 + (b - r) / (max - min);
	}
	else if (max == b) {
		// if blue is the predominent color
		h = 4 + (r - g) / (max - min);
	}

	h = h * 60; // find the sector of 60 degrees to which the color belongs
	// https://www.pathofexile.com/forum/view-thread/1246208/page/45 - hsl color wheel

	if (h > 0) {
		// h is a positive angle in the color wheel
		return Math.floor(h);
	}
	else {
		// h is a negative angle.
		return Math.floor(360 - h);
	}
}

function getRidOfBlueHues() {
	//Get the image data:
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let imgData = img.data;
	for (let i = 0; i < imgData.length; i += 4) {
		const hue = getHue(imgData[i], imgData[i + 1], imgData[i + 2]);
		if (hue > 81 && hue < 345) {
			imgData[i] = 255;
			imgData[i + 1] = 255;
			imgData[i + 2] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
}

function contrastImage(value) {  //input range [-100..100]
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let imgData = img.data;
	value = (parseFloat(value) || 0) + 1;
	for (let i = 0; i < imgData.length; i += 4) {   //r,g,b,a
		imgData[i] = (value * (imgData[i] - 128) + 128) & 255;
		imgData[i + 1] = (value * (imgData[i + 1] - 128) + 128) & 255;
		imgData[i + 2] = (value * (imgData[i + 2] - 128) + 128) & 255;
	}
	ctx.putImageData(img, 0, 0);
}

function polygonSampledFromPath(path, samples) {
	let doc = path.ownerDocument;
	let poly = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon');

	let points = [];
	let retPts = [];
	let len = path.getTotalLength();
	let step = len / samples;
	for (let i = 0; i <= len; i += step) {
		let p = path.getPointAtLength(i);
		points.push(p.x + ',' + p.y);
		retPts.push([p.x, p.y]);
	}
	poly.setAttribute('points', points.join(' '));
	poly.setAttribute('area', -1 * polygonArea(retPts));
	poly.style.fill = "blue";

	return poly;
}

document.getElementById("satLayerBtn").onclick = function () {
	if (canvas.style.visibility == "hidden")
		canvas.style.visibility = "visible";
	else
		canvas.style.visibility = "hidden";
	document.body.style.backgroundColor = "black";
	document.body.style.backgroundImage = "";
}

let svgContainer = document.getElementById("svgcontainer");
document.getElementById("buildingLayerBtn").onclick = function () {
	if (svgContainer.style.visibility == "hidden")
		svgContainer.style.visibility = "visible";
	else
		svgContainer.style.visibility = "hidden";
	document.body.style.backgroundImage = "";
	document.body.style.backgroundColor = "black";
}

function removeLargestAreaPolygon() {
	let polys = document.getElementsByTagName("polygon");
	let maxArea = 0;
	let maxAreaElement = null;
	for (let i = 0; i < polys.length; i++) {
		const currentArea = Number.parseInt(polys[i].getAttribute("area"));
		if (maxArea < currentArea) {
			maxAreaElement = polys[i];
			maxArea = currentArea;
		}
	}
	maxAreaElement.parentNode.removeChild(maxAreaElement);
}

function goThroughAllPathsAndReplaceWithExactPolygon() {
	let paths = document.getElementsByTagName("path");
	console.log("Path length: " + paths.length);
	while (paths.length > 0) {
		for (let i = 0; i < paths.length; i++)
			paths[i].parentNode.replaceChild(polygonSampledFromPath(paths[i], 30), paths[i]);
	}
	removeLargestAreaPolygon();
}

function removeNoise() {
	let numRemoved = 1;
	console.log("Removing Noise...");
	console.log(200 * ((canvas.width * canvas.height) / (2452 * 2858)));
	while (numRemoved > 0) {
		numRemoved = 0;
		let polys = document.getElementsByTagName("polygon");
		for (let i = 0; i < polys.length; i++) {
			if (Number.parseInt(polys[i].getAttribute("area")) < (200 * ((canvas.width * canvas.height) / (2452 * 2858)))) {
				numRemoved++;
				polys[i].parentNode.removeChild(polys[i]);
			}
		}
	}
}

function polygonArea(pts) {
	let area = 0;         // Accumulates area in the loop
	let numPoints = pts.length;
	let j = numPoints - 1;  // The last vertex is the 'previous' one to the first

	for (let i = 0; i < numPoints; i++) {
		area = area + (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
		j = i;  //j is previous vertex to i
	}
	return area / 2;
}

//Attempt at remaking the OSX Preview Contrast.
function makeContrast(val) {
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// let img.data = img.data;
	const OUT_MIN = 0;   // The desired min output luminosity 0   to stretch to entire spectrum
	const OUT_MAX = 255; // The desired max output luminosity 255 to stretch to entire spectrum

	let min = 0, max = 255;

	for (let i = 0; i < img.data.length; i += 4) {   //r,g,b,a
		intensity = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
		min = min < intensity ? min : intensity;
		max = max > intensity ? max : intensity;
	}
	for (let i = 0; i < img.data.length; i += 4) {   //r,g,b,a
		intensity = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
		min = min < intensity ? min : intensity;
		max = max > intensity ? max : intensity;
	}

	// set the new pixel values
	for (let i = 0; i < img.data.length; i += 4) {
		// Creates color image
		// Calculate new color using the formula. Has to be int, not byte, because you might go out of range.
		// We correct the range manually on the next two lines. 
		img.data[i] = (img.data[i] - min) * (OUT_MAX / (max - min)) + OUT_MIN;
		img.data[i] = img.data[i] < 0 ? 0 : img.data[i];
		img.data[i] = img.data[i] > 255 ? 255 : img.data[i];

		img.data[i + 1] = (img.data[i + 1] - min) * (OUT_MAX / (max - min)) + OUT_MIN;
		img.data[i + 1] = img.data[i + 1] < 0 ? 0 : img.data[i + 1];
		img.data[i + 1] = img.data[i + 1] > 255 ? 255 : img.data[i + 1];

		img.data[i + 2] = (img.data[i + 2] - min) * (OUT_MAX / (max - min)) + OUT_MIN;
		img.data[i + 2] = img.data[i + 2] < 0 ? 0 : img.data[i + 2];
		img.data[i + 2] = img.data[i + 2] > 255 ? 255 : img.data[i + 2];
	}
	// img.data = convertImageDataToHSL(img.data);
	img.data = equalizeHistogram(val, img.data);
	// img.data = convertImageDataToRGB(img.data);
	ctx.putImageData(img, 0, 0);
}

function printData() {
	document.getElementById("processedData").innerHTML = document.getElementsByTagName("polygon").length + " buildings in this area <br> = " + document.getElementsByTagName("polygon").length * 5 * 16 + "gJ of energy per year";
	document.getElementsByTagName("polygon").length;

}

/*******************************************
 * MAIN IMAGE PROCESSING ALGORITHM
*********************************************/

function extrapolDataFromImage(orgImg)
{
	invertImgColor();
	getRidOfBlueHues();
	let imgd = ImageTracer.getImgdata(canvas);
	// Synchronous tracing to SVG string
	let svgstr = ImageTracer.imagedataToSVG(imgd, { scale: 1 });
	// Appending SVG
	ImageTracer.appendSVGString(svgstr, 'svgcontainer');
	goThroughAllPathsAndReplaceWithExactPolygon();
	removeNoise();
	setImgOnCanvas(orgImg);
	printData();
}
/************************************************
 * WHERE THE ALGORITHM EXECUTED.
 ************************************************/
function handleFileSelect(evt) {

	let files = evt.target.files; // FileList object.

	// Loop through the FileList and render image files as thumbnails.
	for (let i = 0, f; f = files[i]; i++) {

		let reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				//Once file is uploaded.
				//Do this.
				let img = new Image();
				img.src = reader.result;
				document.getElementById('files').style.visibility = "hidden";
				img.addEventListener('load', function () {
					console.log(img.width, img.height);
					let orgImg = img;
					setImgOnCanvas(img);
					//This should be a replacement for the Mac OSX Preview Algorithm
					// makeContrast(); 
					console.log("Processing img...");
					extrapolDataFromImage(orgImg);
					console.log("Processing complete.")
				}, false);
				// extrapolTileData();
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}


// Setup the dnd listeners.
document.getElementById('files').addEventListener('change', handleFileSelect, false);
