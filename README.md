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
