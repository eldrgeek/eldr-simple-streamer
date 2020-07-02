import getMediaRecorder from "./getMediaRecorder";
import defer from "./defer";

export default async function delayStream(stream, delay = 200, video, timeout) {
  return new Promise((resolve, reject) => {
    if (!video) {
      video = document.createElement("video");
      // video3 = document.querySelector("#video3");
      video.autoplay = video.playsinline = video.controls = true;
    }
    const mediaSource = new MediaSource();
    video.src = window.URL.createObjectURL(mediaSource);
    const recorder = getMediaRecorder(stream);
    mediaSource.onsourceopen = async function() {
      console.log("Added source buffer", mediaSource.sourceBuffers.length);
      let sourceBuffer3 = mediaSource.addSourceBuffer(
        // 'video/webm; codecs="vorbis,vp8"'
        "video/webm;codecs=vp9,opus"
      ); //
      // document.querySelector("#video3").src = delayStream
      let deferred = null;
      //called when the filereader has laoded
      //Called when the next chnuk is added to the source buffer
      recorder.onstop = async () => {
        mediaSource.onsourceopen = () => {};
        await deferred.promise;
        console.log("recorder stop");
        mediaSource.endOfStream();
      };
      // let block = 0;
      let nErrors = 0;
      let reportErrors = null;
      let lastErrors = 0;
      let countBuffers = 0;
      let lastTime = null;
      const N_BUFFERS = 10;
      recorder.ondataavailable = async e => {
        // console.log("data", ++block);
        deferred = defer();
        let buffer = await e.data.arrayBuffer();
        try {
          if (countBuffers++ % N_BUFFERS === 0) {
            const time = new Date();
            if (lastTime !== null) {
              const delta = time.getTime() - lastTime.getTime();
              console.log("Buffer rate ms/buffer", delta / N_BUFFERS);
            }
            lastTime = time;
          }
          if (!timeout) {
            sourceBuffer3.appendBuffer(new Uint8Array(buffer));
          } else {
            setTimeout(
              () => sourceBuffer3.appendBuffer(new Uint8Array(buffer)),
              timeout
            );
          }
        } catch (e) {
          if (!reportErrors) {
            console.log(`error ondatavailable`, e.toString());
            reportErrors = setInterval(() => {
              if (nErrors === lastErrors) {
                clearInterval(reportErrors);
                reportErrors = null;
              } else {
                lastErrors = nErrors;
              }
            }, 10000);
          }
          nErrors++;
        }
        await deferred.promise;
        // if(block <= N_BLOCKS) recorder.resume()
      };
      sourceBuffer3.onupdateend = () => {
        deferred.resolve();
      };
      // fillBuffer(sourceBuffer3, mediaSource)
      console.log("delay", delay);
      if (stream.getTracks().length === 2) {
        console.log("stream strea = ", stream.getTracks().length);

        recorder.start(delay);
        resolve(video.src);
      } else {
        console.log("stream tracks = ", stream.getTracks().length);
        stream.onaddtrack = () => {
          resolve(video.src);
          stream.onaddtrack = () => {};
        };
      }
    };
  });
}
