(function () {
  var d = document.documentElement;
  try {
    var t = localStorage.getItem("gj-tema");
    d.dataset.theme = t === "dark" ? "dark" : "light";
    var f = localStorage.getItem("gj-fonte");
    d.dataset.fonte = f === "small" || f === "large" ? f : "medium";
  } catch (e) {
    d.dataset.theme = "light";
    d.dataset.fonte = "medium";
  }
})();
