import React, { useState } from "react";
import "./styles.css";
import VideoStreamMerger from "./video-stream-merger";
import SimplePeer from "simple-peer";
import timerCanvas from "./timerCanvas";
import labeledStream from "./labeledStream";
// import delayStream from "./delayStream";

const displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
};
let theMerger = null;
const addToMerger = (stream, x, y) => {
  theMerger.addStream(stream, {
    x,
    y,
    width: 100,
    height: 100,
    mute: true
    // draw: function(ctx, frame, done) {
    //   ctx.drawImage(
    //     frame,
    //     200,
    //     200,
    //     200,
    //     200,
    //     0,
    //     theMerger.height - 100,
    //     100,
    //     100
    //   );
    //   done();
    // }
    /*
            audioEffect: function (sourceNode, destinationNode) {
            // merge the input audio and the sine wave
            sourceNode.connect(destinationNode)
            sineNode.connect(destinationNode)
          }
          */
  });
};
export default function App() {
  const videoRef = React.useRef(null);
  const video1Ref = React.useRef(null);
  const video2Ref = React.useRef(null);
  const [camera, setCamera] = React.useState(null);
  // React.useEffect(async () => {
  //   if (video2Ref && video1Ref && camera) {
  //     // video1Ref.current.srcObject = camera;
  //     // const delayedUser = await delayStream(camera, 200, video2Ref.current);
  //     // // addToMerger(video2Ref., 0, 20);
  //     // console.log(delayedUser, delayedUser.getTracks());
  //     // const otherUser = await delayStream(camera, 200, video1Ref.current, 250);
  //     // addToMerger(otherUser, 0,120)
  //   }
  // }, [video1Ref, video2Ref, camera]);

  // const [merger, setMerger] = useState(null);
  React.useEffect(() => {
    // const canvasStream = timerCanvas().captureStream();
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(userStream => {
        const aStream = labeledStream(userStream, "a label");
        // navigator.mediaDevices
        //   .getDisplayMedia(displayMediaOptions)
        //   .then(displayStream => {
        // theMerger = new VideoStreamMerger({
        //   width: 400, // Width of the output video
        //   height: 300, // Height of the output video
        //   fps: 25, // Video capture frames per second
        //   clearRect: true, // Clear the canvas every frame
        //   audioContext: null // Supply an external AudioContext (for audio effects)
        // });
        // theMerger.addStream(userStream, {
        //   x: 0, // position of the topleft corner
        //   y: 0,
        //   width: theMerger.width,
        //   height: theMerger.height,
        //   mute: true // we don't want sound from the screen (if there is any)
        // });

        //Add the webcam stream. Position it on the bottom left and resize it to 100x100.
        // theMerger.addStream(delayedUser, {
        //   x: 0,
        //   y: theMerger.height - 100,
        //   width: 100,
        //   height: 100,
        //   mute: true
        //   // draw: function(ctx, frame, done) {
        //   //   ctx.drawImage(
        //   //     frame,
        //   //     200,
        //   //     200,
        //   //     200,
        //   //     200,
        //   //     0,
        //   //     theMerger.height - 100,
        //   //     100,
        //   //     100
        //   //   );
        //   //   done();
        //   // }
        //   /*
        //   audioEffect: function (sourceNode, destinationNode) {
        //   // merge the input audio and the sine wave
        //   sourceNode.connect(destinationNode)
        //   sineNode.connect(destinationNode)
        // }
        // */
        // });
        // const text = "ho";
        // theMerger.addStream(canvasStream, {
        //   x: 0,
        //   y: theMerger.height - 100,
        //   width: 100,
        //   height: 100,
        //   mute: true,
        //   draw: function(ctx, frame, done) {
        //     ctx.font = "48px serif";
        //     ctx.fillStyle = "white";
        //     ctx.strokeStyle = "boack";
        //     ctx.fillText(text, 10, 50);
        //     ctx.strokeText(text, 10, 50);
        //     done();
        //   }
        // });
        // theMerger.addStream(canvasStream, {
        //   x: 0,
        //   y: 0,
        //   width: 40,
        //   height: 15,
        //   mute: true
        // });
        // theMerger.start();
        // let peer1 = new SimplePeer({
        //   initiator: true,
        //   stream: theMerger.result
        // });
        // peer1.on("signal", function(data) {
        //   console.log(data);
        // });
        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = aStream.result;
          console.log(aStream.result.getTracks());
        }
        // });
      });
  }, [videoRef]);
  const users = {};
  "Mike,Jess,Noel,Joe,Bill,Bob".split(",").forEach((name, index) => {
    const id = `session-${index}`;
    users[id] = { id, name };
  });
  const userByName = name => {
    let id;
    Object.keys(users).forEach(key => {
      if (users[key].name === name) id = key;
    });
    return id;
  };
  const usersByName = list => {
    return list.map(name => userByName(name)).filter(source => source);
  };
  const missingUsers = list => {
    return list.filter(name => !userByName(name)).join(",");
  };
  const command = "Noel, Jess, Fred=>Joe, Bill";
  const parser = command => {
    const result = command.split(/^(.*)=>(.*)$/);
    if (result) {
      const sources = result[1].split(",").map(name => name.trim());
      const destinations = result[2].split(",").map(name => name.trim());
      return missingUsers(sources) ? true : false;
    }
  };

  const makeBounds = (cols, rows, width, height) => {
    const bounds = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        bounds.push({
          x: c * width,
          y: r * height,
          width,
          height
        });
      }
    }
    return bounds;
  };
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      {JSON.stringify(makeBounds(2, 2, 16, 9))}
      {/* <video width={200} ref={videoRef} autoPlay playsInline  /> */}
      {/* <video width={200} ref={video1Ref} autoPlay playsInline controls />
      <video width={200} ref={video2Ref} autoPlay playsInline controls /> */}
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
