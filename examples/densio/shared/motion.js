(() => {
  const root = document.querySelector('.anatomy-journey');
  const section = root.querySelector('#process');
  const scene = section.querySelector('.process-scene');
  const workflow = section.querySelector('[data-workflow]');
  const steps = [...workflow.querySelectorAll('[data-stage]')];
  const panels = [...workflow.querySelectorAll('[data-scene]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = (a,b,x) => {const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  let current = 0, scrollMode = false;

  function render(index, fraction=1, phase=index+fraction) {
    current = index;
    steps.forEach((step,i) => {step.classList.toggle('active',i===index);step.setAttribute('aria-pressed',String(i===index));panels[i].hidden=i!==index;});
    workflow.dataset.currentStage=String(index);
    workflow.dataset.stageProgress=fraction.toFixed(4);
    root.querySelector('.specimen-stage').dataset.workflowStep=String(index);
    workflow.querySelector('.process-progress').style.transform=`scaleX(${phase/3})`;
    workflow.querySelector('.process-position').textContent=`${index+1} / 3`;
    const exposure = !scrollMode ? 1 : (index===0?1:smooth(0,.14,fraction))*(index===2?1:1-smooth(.87,1,fraction));
    const activePanel=panels[index];
    activePanel.style.opacity=String(exposure);
    activePanel.style.transform=`translateY(${(1-smooth(0,.2,fraction))*10}px)`;
    const reveal=scrollMode&&!reduce.matches?smooth(0,.18,fraction):1;
    activePanel.style.clipPath=reveal===1?'none':`inset(0 0 ${(1-reveal)*6}% 0)`;
    if(!scrollMode)activePanel.style.transform='none';
    workflow.style.setProperty('--file-progress',smooth(.08,.72,fraction));
    workflow.style.setProperty('--file-done',smooth(.72,.84,fraction));
    workflow.style.setProperty('--verdict-stroke',150*(1-smooth(.05,.32,fraction)));
    panels[1].querySelectorAll('.analysis-checks span').forEach((el,i)=>el.style.setProperty('--item-progress',.45+.55*smooth(.14+i*.2,.36+i*.2,fraction)));
    panels[2].querySelectorAll('.study').forEach((el,i)=>el.style.setProperty('--item-progress',.5+.5*smooth(.12+i*.16,.34+i*.16,fraction)));
    window.dispatchEvent(new CustomEvent('densio:workflow',{detail:{index,progress:fraction,phase}}));
  }
  function renderAt(y) {
    if(!scrollMode)return;
    const start=section.getBoundingClientRect().top+scrollY;
    const travel=Math.max(1,section.offsetHeight-scene.offsetHeight);
    const phase=clamp((y-start)/travel)*3;
    const index=Math.min(2,Math.floor(phase));
    render(index,clamp(phase-index),phase);
  }
  function choose(index) {
    if(!scrollMode){render(index,1);return;}
    const start=section.getBoundingClientRect().top+scrollY;
    const y=start+(section.offsetHeight-scene.offsetHeight)*(index+.38)/3;
    scrollTo({top:y,behavior:'instant'});
    window.dispatchEvent(new CustomEvent('densio:seek',{detail:{y}}));
    renderAt(y);
  }
  function configure() {
    root.classList.toggle('workflow-scroll',!reduce.matches);
    let fits=true;
    panels.forEach(panel=>{panels.forEach(item=>item.hidden=item!==panel);if(scene.scrollHeight>scene.clientHeight+2)fits=false;});
    panels.forEach((panel,i)=>panel.hidden=i!==current);
    scrollMode=!reduce.matches&&innerHeight>=500&&fits;
    root.classList.toggle('workflow-scroll',scrollMode);
    workflow.dataset.mode=scrollMode?'scroll':'manual';
    section.querySelector('.process-hint').textContent=scrollMode?'Прокрутите, чтобы пройти три этапа.':'Выберите этап, чтобы посмотреть результат.';
    if(scrollMode)renderAt(scrollY);else render(current,1);
  }
  workflow.classList.add('workflow-ready');
  steps.forEach((step,i)=>{
    step.disabled=false;
    step.addEventListener('click',()=>choose(i));
    step.addEventListener('keydown',event=>{
      let next;
      if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%3;
      else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+2)%3;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=2;
      else return;
      event.preventDefault();choose(next);steps[next].focus({preventScroll:true});
    });
  });
  window.DensioWorkflow={renderAt,configure};
  window.addEventListener('resize',configure);
  reduce.addEventListener('change',configure);
  document.fonts.ready.then(configure);
  render(0,0);configure();
})();
