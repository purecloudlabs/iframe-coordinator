console.log('worker started')
let interval = 0;
  // Ask the host app to show the toast.

  function doStuff() {
    interval++
 }

 setInterval(doStuff, 1000);


onmessage = function(e) {
    console.log('got message', e.data)
    console.log(interval)
    postMessage(interval);
  }
