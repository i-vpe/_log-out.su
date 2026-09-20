(() => {
  const root=document.querySelector('.anatomy-journey');
  const stage=root.querySelector('.specimen-stage');
  const frameBox=stage.querySelector('.specimen-frame');
  const map=stage.querySelector('.specimen-map');
  const head=stage.querySelector('.scanner-head');
  const connector=stage.querySelector('.specimen-connections');
  const path=connector.querySelector('path');
  const connectionTip=connector.querySelector('.connection-tip');
  const routes=[...map.querySelectorAll('.focus-route')];
  const callout=stage.querySelector('.specimen-callout');
  const workflow=root.querySelector('[data-workflow]');
  const inspections=[...root.querySelectorAll('.check[data-inspection]')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const object=stage.querySelector('.specimen-object');
  const heroCopy=root.querySelector('.hero-copy');
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  const color=(a,b,t)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(' ')})`;
  const tokens=getComputedStyle(root);
  const rgb=name=>tokens.getPropertyValue(name).trim().split(/\s+/).map(Number);
  const palette={hero:rgb('--scene-hero-rgb'),day:rgb('--scene-day-rgb'),scan:rgb('--scene-scan-rgb')};
  let currentY=scrollY, targetY=scrollY, raf=null, previousTime=0;
  let pointerX=0, pointerY=0, targetPointerX=0, targetPointerY=0;
  let chapter='hero';
  let lastAnchors=null;
  let checkReveal=1, lastInspection=0;
  const sectionNames=['hero','problem','process','checks'];
  const sections=sectionNames.map(name=>root.querySelector(`.${name}`));
  function positionTraces(anchors){
    if(lastAnchors===anchors)return;
    lastAnchors=anchors;
    const origins=[anchors.secondary||[512,420],anchors.main,anchors.checks[2]];
    const ends=[[800,245],[850,680],[190,1125]];
    routes.forEach((route,i)=>{
      const [x,y]=origins[i], [ex,ey]=ends[i];
      const bend=ex>x?ex-44:ex+44;
      route.querySelector('path').setAttribute('d',`M${x} ${y} C${bend} ${y},${bend} ${ey},${ex} ${ey}`);
      const origin=route.querySelector('.focus-origin');origin.setAttribute('cx',x);origin.setAttribute('cy',y);
      route.querySelectorAll('.focus-node,.focus-center').forEach(node=>{node.setAttribute('cx',ex);node.setAttribute('cy',ey);});
    });
  }
  function connect(progress=1){
    if(innerWidth<900)return;
    const selected=Number(stage.dataset.inspection||0);
    const target=chapter==='problem'?callout:chapter==='checks'?inspections[selected]:root.querySelector('.check-readout');
    const anchors=map.densioAnchors||{checks:[[535,760],[740,640],[570,800],[470,280]],main:[420,200]};
    const anchor=chapter==='checks'?anchors.checks[selected]:anchors.main;
    const matrix=map.getScreenCTM();if(!matrix)return;
    const a=new DOMPoint(...anchor).matrixTransform(matrix);
    const box=target.getBoundingClientRect(), viewport=frameBox.getBoundingClientRect();
    const x=box.left-viewport.left-14,y=box.top-viewport.top+(chapter==='problem'?box.height/2:28);
    const ax=a.x-viewport.left,ay=a.y-viewport.top;
    connector.setAttribute('viewBox',`0 0 ${frameBox.clientWidth} ${frameBox.clientHeight}`);
    const bend=ax+(x-ax)*.58;
    path.setAttribute('d',`M${ax},${ay} C${bend},${ay} ${bend},${y} ${x},${y}`);
    connectionTip.setAttribute('cx',x);connectionTip.setAttribute('cy',y);
    stage.style.setProperty('--connector-draw',1-progress);
    stage.style.setProperty('--connector-tip',smooth(.8,1,progress));
  }
  function render(){
    const narrow=innerWidth<900;
    object.style.setProperty('--pointer-x',`${(pointerX*(narrow?4:10)).toFixed(3)}px`);
    object.style.setProperty('--pointer-y',`${(pointerY*(narrow?2:6)).toFixed(3)}px`);
    object.style.setProperty('--pointer-angle',`${(pointerX*(narrow?.65:2)).toFixed(3)}deg`);
    const y=currentY;
    if(narrow){
      // Keep the artwork's lower edge moving with the normal-flow title until compact.
      const expandedHeight=parseFloat(getComputedStyle(heroCopy).paddingTop)-16;
      const travel=Math.max(1,expandedHeight-innerHeight*.3);
      root.style.setProperty('--hero-open',reduce.matches?1:clamp(1-scrollY/travel));
    }
    const starts=sections.map(el=>el.getBoundingClientRect().top+scrollY);
    const index=starts.reduce((i,start,n)=>start<=y+innerHeight*.28?n:i,0);
    chapter=sectionNames[index];stage.dataset.chapter=chapter;
    const light=reduce.matches?1:smooth(innerHeight*.70,innerHeight*1.65,y);
    const processPhase=Number(workflow.dataset.currentStage||0)+Number(workflow.dataset.stageProgress||0);
    const scanTone=smooth(.65,1.3,processPhase)*(1-smooth(1.7,2.5,processPhase));
    const daylight=palette.day.map((v,i)=>v+(palette.scan[i]-v)*(chapter==='process'?scanTone:0));
    const environment=color(palette.hero,daylight,light);
    root.style.setProperty('--environment',environment);
    root.style.setProperty('--bone-light',1.08-.08*light);
    const checkWarm=.35*smooth(starts[3]-innerHeight*.4,starts[3]+innerHeight*.3,y);
    root.style.setProperty('--warmth',clamp((chapter==='process'?scanTone:0)+checkWarm));
    stage.style.setProperty('--roi-opacity',chapter==='process'?.12+.48*scanTone:chapter==='checks'?0:.12);
    const fraction=Number(workflow.dataset.stageProgress||0), step=Number(workflow.dataset.currentStage||0);
    const scanning=chapter==='process'&&step===1;
    stage.style.setProperty('--scanner-opacity',scanning?smooth(.02,.15,fraction)*(1-smooth(.88,1,fraction))*.75:0);
    stage.style.setProperty('--annotation-opacity',scanning?smooth(.18,.7,fraction)*.7:0);
    stage.style.setProperty('--annotation-draw',scanning?1-smooth(.18,.75,fraction):1);
    stage.style.setProperty('--result-opacity',chapter==='process'&&step===2?smooth(.1,.4,fraction)*.65:0);
    const scanProgress=reduce.matches?.55:smooth(.05,.86,fraction);
    head.setAttribute('transform',`translate(0 ${(75+1380*scanProgress).toFixed(2)})`);
    const heroOpacity=reduce.matches||narrow?1:1-smooth(innerHeight*.12,innerHeight*.65,y);
    const problemOpacity=reduce.matches?1:smooth(starts[1]+innerHeight*.44,starts[1]+innerHeight*.8,y);
    sections[0].querySelector('.hero-copy').style.opacity=heroOpacity;
    sections[0].querySelector('.hero-bottom').style.opacity=heroOpacity;
    root.querySelector('.problem-copy').style.opacity=problemOpacity;
    root.querySelector('.problem-copy').style.transform=`translateY(${(1-problemOpacity)*16}px)`;
    const problemProgress=clamp((y-starts[1])/(sections[1].offsetHeight-innerHeight||1));
    root.querySelectorAll('.problem-line').forEach((el,i)=>el.classList.toggle('active',i===Math.min(2,Math.floor(problemProgress*3))));
    const anchors=map.densioAnchors||{main:[420,200],checks:[[535,760],[740,640],[570,800],[470,280]]};
    positionTraces(anchors);
    const focusExit=1-smooth(starts[2]+innerHeight*.1,starts[2]+innerHeight*.55,y);
    routes.forEach((route,i)=>{
      const progress=reduce.matches?1:smooth(starts[1]+innerHeight*(-.12+i*.17),starts[1]+innerHeight*(.3+i*.17),y);
      route.style.setProperty('--trace-opacity',focusExit*smooth(0,.1,progress)*.8);
      route.style.setProperty('--trace-draw',1-progress);
      route.style.setProperty('--trace-origin',smooth(.1,.35,progress));
      route.style.setProperty('--trace-node',smooth(.72,1,progress));
      route.style.setProperty('--trace-scale',.7+.3*smooth(.72,1,progress));
    });
    const calloutProgress=reduce.matches?1:smooth(starts[1]+innerHeight*.38,starts[1]+innerHeight*.68,y);
    const calloutExit=1-smooth(starts[2]-innerHeight*.55,starts[2]-innerHeight*.3,y);
    stage.style.setProperty('--callout-opacity',chapter==='problem'?smooth(.65,1,calloutProgress)*calloutExit:0);
    const inspection=Number(stage.dataset.inspection||0);
    if(inspection!==lastInspection){checkReveal=0;lastInspection=inspection;}
    const checksEntry=reduce.matches?1:smooth(starts[3]-innerHeight*.24,starts[3]+innerHeight*.12,y);
    const lineProgress=chapter==='problem'?calloutProgress:chapter==='checks'?Math.min(checksEntry,smooth(0,1,checkReveal)):scanning?smooth(.3,.6,fraction):0;
    stage.style.setProperty('--connector-opacity',lineProgress*(chapter==='problem'?calloutExit:1)*.6);
    if(lineProgress>0)connect(lineProgress);
    const rootBottom=root.getBoundingClientRect().bottom;
    stage.style.visibility=rootBottom>0?'visible':'hidden';
  }
  function tick(time){
    raf=null;
    const delta=Math.min(40,previousTime?time-previousTime:16.7);previousTime=time;
    const amount=reduce.matches?1:1-Math.exp(-delta/105);
    currentY+=(targetY-currentY)*amount;
    if(Math.abs(targetY-currentY)<.25)currentY=targetY;
    if(reduce.matches||!finePointer.matches)targetPointerX=targetPointerY=0;
    const pointerAmount=reduce.matches?1:1-Math.exp(-delta/160);
    checkReveal=reduce.matches?1:Math.min(1,checkReveal+delta/620);
    pointerX+=(targetPointerX-pointerX)*pointerAmount;
    pointerY+=(targetPointerY-pointerY)*pointerAmount;
    if(Math.abs(targetPointerX-pointerX)<.001)pointerX=targetPointerX;
    if(Math.abs(targetPointerY-pointerY)<.001)pointerY=targetPointerY;
    window.DensioWorkflow.renderAt(currentY);
    render();
    if((currentY!==targetY||pointerX!==targetPointerX||pointerY!==targetPointerY||checkReveal<1)&&!document.hidden)raf=requestAnimationFrame(tick);
  }
  function schedule(){targetY=scrollY;if(raf===null&&!document.hidden){previousTime=0;raf=requestAnimationFrame(tick);}}
  function resetPointer(){targetPointerX=targetPointerY=0;schedule();}
  root.addEventListener('pointermove',event=>{
    if(!finePointer.matches||reduce.matches||event.pointerType==='touch')return;
    targetPointerX=clamp(event.clientX/innerWidth)*2-1;
    targetPointerY=clamp(event.clientY/innerHeight)*2-1;
    schedule();
  },{passive:true});
  root.addEventListener('pointerleave',resetPointer);
  window.addEventListener('blur',resetPointer);
  finePointer.addEventListener('change',resetPointer);
  inspections.forEach((button,index)=>{
    button.addEventListener('click',()=>{inspections.forEach((item,i)=>item.setAttribute('aria-pressed',String(i===index)));stage.dataset.inspection=String(index);schedule();});
    button.addEventListener('keydown',event=>{const offset=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;if(!offset)return;event.preventDefault();const next=inspections[(index+offset+4)%4];next.focus({preventScroll:true});next.click();});
  });
  root.classList.add('journey-ready');
  document.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>{currentY=scrollY;schedule();});
  window.addEventListener('densio:seek',event=>{currentY=event.detail.y;targetY=currentY;render();});
  window.addEventListener('densio:workflow',()=>{if(reduce.matches||workflow.dataset.mode==='manual')render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf!==null)cancelAnimationFrame(raf);raf=null;}else schedule();});
  reduce.addEventListener('change',()=>{currentY=scrollY;resetPointer();});
  document.fonts.ready.then(()=>{window.DensioWorkflow.configure();schedule();});
  render();schedule();
})();
