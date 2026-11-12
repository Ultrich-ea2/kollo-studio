(() => {
  "use strict";
  const config = JSON.parse(document.getElementById("presenter-data").textContent);
  mountPresenter(document.getElementById("kollo-player"), config);
})();
