# EDFRoofDetection
This satellite img roof detection algorithm was created for the Électricité de France Hackathon at 42 Silicon Valley. 
If given an satellite image, this program can find all the roof tops and calculate the approximate number of buildings
in the satellite image.

# Usage
To run the program, 
1. First clone the repo.
2. After cloning, in the directory where the repo was cloned, run (node runs on port 5000, so make sure port 5000 is open:
      `node server.js`
   <br>**Make sure to have nodejs installed on the computer before node will work. This is important as inorder to bypass the 
   cross origin error, the app must be started with node.
3. Then, after running `node server.js`, go to your `localhost:5000` or `[SERVER IP]:5000`.
You should see a page like: 
![image](https://raw.githubusercontent.com/alnimra/EDFRoofDetection/master/readmeimgs/Img1.png)
4. Before we can upload an image, your image must be processed in preview to add a quick contrast required by the algorithm.
To do so, open any satellite image with roofs in preview. You should get something like:
![image2](https://raw.githubusercontent.com/alnimra/EDFRoofDetection/master/readmeimgs/org.png)
5. Now increase the contrast by going to: Tools >> Adjust Color, giving a result like so:
![image3](https://raw.githubusercontent.com/alnimra/EDFRoofDetection/master/readmeimgs/previewcontrastsetting.png)
6. Now upload the resulting contrasted image: 
For example: 
![image4](https://raw.githubusercontent.com/alnimra/EDFRoofDetection/master/readmeimgs/contrasted.png)
7. Finally after uploading the contrasted image, and waiting a few moments, you should get an analysis of the roof tops as:
![image4](https://raw.githubusercontent.com/alnimra/EDFRoofDetection/master/readmeimgs/result.png)

# The Algorithm
The main assumption of this algorithm is that roof tops are higher in elevation thus giving them a more uniform color. For this specific app, the uniform color that was assumed was white, as sunlight causes the roofs to appear so. First, we filter all the colors out to be left with only these uniform patches. Patches of a certain size are considered to be roof tops.
1. First the satellite image is contrasted with the OSX Preview Contrast Filter set to the max setting.
2. Then the image is processed automatically in the app by: 
      <br>
      a) Inverting colors, to get a more freindly color selection of the hues (this step is not necessary, but was done for getting a better intuition of the algorithm. Also, if this step is not applied, the rest of the algorithm will not work.
      <br>
      b) Removing dark hues that are considered as noise to allow for easier detection of the roofs.
      <br>
      c) Then the entire image is converted into SVG format so the area of each color block can be calculated.
      <br>
      d) The image of each svg path is calculated, and any image with an area larger than a certain ratio size, will be removed selected as noise.
      <br>
      e) Finally the number of larger blocks will be counted and reported, assumed to be buildings (within some error, depending on the number of bright spots in the image orginally.

If you have any questions, contact: raymilant@gmail.com.
(-m-ゞ
