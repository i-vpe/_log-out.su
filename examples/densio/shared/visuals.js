/* Dot-matrix notation for the existing three stages. No medical metrics. */
(() => {
  const ns='http://www.w3.org/2000/svg';
  const glyphs={0:['01110','10001','10011','10101','11001','10001','01110'],1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00010','00100','01000','11111'],3:['11110','00001','00001','01110','00001','00001','11110']};
  const svg=(className,viewBox)=>{const el=document.createElementNS(ns,'svg');el.setAttribute('class',className);el.setAttribute('viewBox',viewBox);el.setAttribute('aria-hidden','true');el.setAttribute('focusable','false');return el;};
  const circle=(x,y,r)=>{const el=document.createElementNS(ns,'circle');el.setAttribute('cx',x);el.setAttribute('cy',y);el.setAttribute('r',r);return el;};
  function number(value){const el=svg('dot-number','0 0 60 36');String(value).split('').forEach((digit,i)=>glyphs[digit].forEach((row,y)=>[...row].forEach((on,x)=>{if(on==='1')el.append(circle(i*30+x*5+5,y*5+3,1.65));})));el.setAttribute('fill','currentColor');return el;}
  document.querySelectorAll('[data-matrix]').forEach(host=>host.append(number(host.dataset.matrix)));
  document.querySelectorAll('.workflow-scene .result-head').forEach((head,i)=>head.append(number(`0${i+1}`)));
  const groups=[];
  document.querySelectorAll('.specimen-aura,.check-readout').forEach((host)=>{
    const el=svg('data-points','0 0 250 28');
    for(let x=0;x<30;x++)for(let y=0;y<3;y++){const point=circle(5+x*8.2,5+y*9,1.7);point.dataset.column=x;point.style.opacity='.2';el.append(point);}
    host.append(el);groups.push(el);
  });
  window.addEventListener('densio:workflow',event=>{
    const progress=event.detail.progress;
    groups.forEach(el=>{for(const point of el.children)point.style.opacity=Number(point.dataset.column)/29<=progress?'.85':'.18';});
  });
})();
