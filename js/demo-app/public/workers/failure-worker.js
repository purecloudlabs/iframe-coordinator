// This worker is designed to showcase error worker error handling.
// The bug is intentional
setTimeout(function () {
  foo.bar.baz();
}, Math.max(5000, Math.random() * 10000));