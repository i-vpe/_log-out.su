(() => {
  const map = document.querySelector('.specimen-map');
  if (!map) return;
  const selectors = ['.specimen-registration','.specimen-region','.annotation-scan','.annotation-result','.inspection-position','.inspection-boundary','.inspection-artifact','.inspection-markup'];
  const saved = selectors.map(selector => [map.querySelector(selector), map.querySelector(selector).innerHTML]);
  const points = [...map.querySelectorAll('.specimen-point')];
  const pointMarkup = points.map(point => point.innerHTML);
  const scanner = map.querySelector('.scanner-assembly');
  const subjects = {
    '04-pelvis': {main:[735,750], secondary:[512,330], roi:'M630 660H900V940H630Z', checks:[[512,380],[870,610],[750,830],[735,750]]},
    '05-thorax': {main:[690,690], secondary:[512,420], roi:'M600 450H820V940H600Z', checks:[[512,420],[870,760],[710,830],[690,690]]},
    '06-forearm': {main:[515,725], secondary:[510,1080], roi:'M355 620H650V835H355Z', checks:[[512,1100],[700,700],[565,775],[515,725]]}
  };
  function set(selector, html) { map.querySelector(selector).innerHTML = html; }
  window.DensioXray = {apply(key) {
    const subject = subjects[key];
    if (!subject) {
      saved.forEach(([node, html]) => { node.innerHTML = html; });
      points.forEach((point, index) => { point.innerHTML = pointMarkup[index]; });
      scanner.removeAttribute('transform');
      delete map.densioAnchors;
      return;
    }
    map.densioAnchors = subject;
    const [x,y] = subject.main;
    set('.specimen-registration','<path d="M125 100H75v50m0 1235v50h50m775-1335h50v50m0 1235v50h-50"/>');
    set('.specimen-region',`<path d="${subject.roi}"/><circle cx="${x}" cy="${y}" r="5"/>`);
    set('.annotation-scan',`<path pathLength="1" d="${subject.roi}M512 140v1180"/><path pathLength="1" d="M120 100H90v1320h30M900 100h30v1320h-30"/>`);
    set('.annotation-result',`<path pathLength="1" d="M${x} ${y}h140m-45 0 10 10 20-25"/><circle cx="${x}" cy="${y}" r="16"/>`);
    set('.inspection-position','<path d="M512 145v1200M360 1395h305" stroke-dasharray="5 10"/><path d="M492 770h40m-20-20v40"/>');
    set('.inspection-boundary','<path d="M80 90h865v1350H80Z" stroke-dasharray="8 12"/>');
    const [ax,ay] = subject.checks[2];
    set('.inspection-artifact',`<circle cx="${ax}" cy="${ay}" r="42"/><path d="m${ax-15} ${ay-15} 30 30m0-30-30 30M${ax+40} ${ay}h90"/>`);
    set('.inspection-markup',`<path d="${subject.roi}"/><path d="M${x-35} ${y}h70m-35-35v70"/>`);
    [subject.main,subject.secondary].forEach(([px,py],index) => {
      points[index].innerHTML = `<circle class="specimen-pulse" cx="${px}" cy="${py}" r="9"/><circle cx="${px}" cy="${py}" r="4"/>`;
    });
    scanner.setAttribute('transform','matrix(1.45 0 0 1 -232 0)');
  }};
  // The selected anatomy is also used by the main page, without a preview toolbar.
  if (subjects[document.documentElement.dataset.xray]) {
    window.DensioXray.apply(document.documentElement.dataset.xray);
  }
})();
