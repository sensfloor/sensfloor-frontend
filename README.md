# Sensfloor Pose Viewer
This Frontend is built to visualize the outputs from here https://github.com/sensfloor/sensfloor-pipeline
but it can be used to visualize any JSON pose in the form of [this](./public/sample-data.js)

![Skeleton](./public/frontend-scene.png)


Additionally, Multiple CSV files can be streamed to compare poses

![Skeleton](./public/frontend-comparison.png)

To find out exactly how to configure the app, go [here](./src/config.js)

# Prerequisites
To be able to run this app you will need `npm` (recommended at least version 9.6.7)

# Starting the app
Run the following commands in the root repository

`npm install`  
`npm run dev`

You should be prompted to open http://localhost:5173/ to see the app