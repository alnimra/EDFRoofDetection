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

//0.3: Simple Library Fxs for array manipulation
function oneDtoTwoD(list, elementsPerSubArray) { //Converting 1d array to 2d Array
	let matrix = [],
		i, k;
	for (i = 0, k = -1; i < list.length; i++) {
		if (i % elementsPerSubArray === 0) {
			k++;
			matrix[k] = [];
		}
		matrix[k].push(list[i]);
	}
	return matrix;
}
//1.FILE
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	console.log("File API is Supported");
} else {
	alert('The File APIs are not fully supported in this browser.');
}

function saveFile(filename, data) {
	let blob = new Blob([data], { type: 'text/js' });
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	}
	else {
		let elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
	}
}

//2: GENERATION OF THE TILE SET DATA
//2.1: Tile Type Definitions [MEANT TO BE USER CONFIGURABLE]
//Format for each element:- [id, walkability, rectangular region of containment]
const tileDefs = [['g', true, [0, 0, dim * 6, dim * 3]], ['dr', true, [0, dim * 3, dim * 6, dim * 3]], ['s', true, [0, dim * 6, dim * 6, dim * 3]],
['w', false, [dim * 6, 0, dim * 6, dim * 3]], ['st', true, [dim * 6, dim * 3, dim * 6, dim * 3]], ['tr', false, [dim * 6, dim * 6, dim * 6, dim * 3]],
['ST', false, [0, dim * 9, dim * 4, dim * 4]], ['Rtr', false, [dim * 6, dim * 9, dim * 2, dim * 2]], ['SeedTmpl', true, [dim * 12, 0, 32 * dim, 14 * dim]], ['astrCnt', true, [44 * dim, 0, 27 * dim, 25 * dim]]];

//2.2: Extrapolating img data x tileDefs for main Tile Set Data
//2.2.1: Set the img data onto the canvas for editing
function setImgOnCanvas(img) {
	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);
}
//2.2.2: Get the alpha pixel array for each pixel (to find completly transparent tiles)
function getAlphaPixArray() {
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	let pixAlpha = [];
	for (let i = 3; i < imgData.length; i += 4)
		pixAlpha.push(imgData[i]);
	return oneDtoTwoD(pixAlpha, canvas.width);
}

//2.2.3: Cycle through all the regions and get the tile data
//2.2.3.1: Helper Function for checking if the tile is transparent
function checkIfTransTile(r, c, dim, alphaA) {
	for (let cT = c; cT < c + dim; cT++) {
		for (let rT = r; rT < r + dim; rT++) {
			if (alphaA[cT][rT] != 0) {
				return false;
			}
		}
	}
	console.log('trans');
	return true;
}
function extrapolTileData() {
	const alphaA = getAlphaPixArray();
	let tileData = "";
	console.log('Got full alpha array');
	//Cycle through the tileDefs to set the required tile meta data
	for (let i = 0; i < tileDefs.length; i++) {
		let regionData = tileDefs[i][2];
		let idCnt = 0;
		console.log('Converting ' + tileDefs[i][0] + ' tile data...');
		for (let c = regionData[1]; c < regionData[1] + regionData[3]; c += dim) {
			for (let r = regionData[0]; r < regionData[0] + regionData[2]; r += dim) {
				//Check if its a transparent tile
				const isTrans = checkIfTransTile(r, c, dim, alphaA);
				if (!isTrans) {
					tileData += tileDefs[i][0] + idCnt + ': new Tile({ compoundX: ' + (r / 32) + ', compoundY: ' + (c / 32) + ", id: '" + tileDefs[i][0] + idCnt + "', isWalkable: " + tileDefs[i][1] + "}), \r\n";
					idCnt++;
				}
			}
		}
		console.log('Finished with ' + tileDefs[i][0] + ' tile data...');
	}
	//save the tile data
	saveFile('tileData.txt', tileData);

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
function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;

	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [h, s, l];
}
function hslToRgb(h, s, l) {
	let r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [r * 255, g * 255, b * 255];
}

function convertImageDataToHSL(imgData) {
	for (let i = 0; i < imgData.length; i += 4) {   //r,g,b,a
		let hsl = rgbToHsl(imgData[i], imgData[i + 1], imgData[i + 2]);
		imgData[i] = hsl[0];
		imgData[i + 1] = hsl[1];
		imgData[i + 2] = hsl[2];
	}
	return imgData;
}
function convertImageDataToRGB(imgData) {
	for (let i = 0; i < imgData.length; i += 4) {   //r,g,b,a
		let rgb = hslToRgb(imgData[i], imgData[i + 1], imgData[i + 2]);
		imgData[i] = rgb[0];
		imgData[i + 1] = rgb[1];
		imgData[i + 2] = rgb[2];
	}
	return imgData;
}

equalizeHistogram = function (val, src, dst) {
	let srcLength = src.length;
	if (!dst) { dst = src; }

	// Compute histogram and histogram sum:
	let hist = new Float32Array(256);
	let sum = 0;
	for (let i = 0; i < srcLength; ++i) {
		++hist[~~src[i]];
		++sum;
	}

	// Compute integral histogram:
	let prev = hist[0];
	for (let i = 1; i < 256; ++i) {
		prev = hist[i] += prev;
	}

	// Equalize image:
	let norm = val / sum;
	for (let i = 0; i < srcLength; ++i) {
		dst[i] = hist[~~src[i]] * norm;
	}
	return dst;
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

function convertToGrayscale() {
	//Get the image data:
	let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let imgData = img.data;
	for (let i = 0; i < imgData.length; i += 4) {
		let gray = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3
		imgData[i] = gray;
		imgData[i + 1] = gray;
		imgData[i + 2] = gray;
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

function printData(){
	document.getElementById("processedData").innerHTML = document.getElementsByTagName("polygon").length + " buildings in this area <br> = " + document.getElementsByTagName("polygon").length * 5 * 16 + "gJ of energy per year";
	document.getElementsByTagName("polygon").length;
	
}
//3: ACTIONABLE THREAD

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
					// makeContrast();
					invertImgColor();
					getRidOfBlueHues();
					let imgd = ImageTracer.getImgdata(canvas);

					// Synchronous tracing to SVG string
					let svgstr = ImageTracer.imagedataToSVG(imgd, { scale: 1 });

					// Appending SVG
					ImageTracer.appendSVGString(svgstr, 'svgcontainer');
					setImgOnCanvas(orgImg);
					goThroughAllPathsAndReplaceWithExactPolygon();
					removeNoise();
					printData();
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
