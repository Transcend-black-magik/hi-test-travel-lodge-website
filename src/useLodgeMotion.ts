import { useEffect } from 'react';
import Lenis from 'lenis';
import Snap from 'lenis/snap';
import 'lenis/dist/lenis.css';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const v=clamp(n);return v*v*(3-2*v);};
export function useLodgeMotion(){
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');let dispose=()=>{};
  const setup=()=>{
   dispose();const reduced=preference.matches;
   const track=document.querySelector<HTMLElement>('.chapter-track')!,stage=document.querySelector<HTMLElement>('.chapter-stage')!;
   const chapters=Array.from(stage.querySelectorAll<HTMLElement>('[data-chapter]'));
   const groups=chapters.map(chapter=>({chapter,objects:Array.from(chapter.querySelectorAll<HTMLElement>('[data-object]'))}));
   const header=document.querySelector<HTMLElement>('.lodge-header')!;
   const hero=document.querySelector<HTMLElement>('.lodge-hero')!;
   const lenis=reduced?null:new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:{offset:-header.clientHeight},prevent:node=>Boolean(node.closest('.modal-backdrop,.customer-dialog,input,select,textarea'))});
   const snap=lenis?new Snap(lenis,{type:'mandatory',duration:.95,debounce:180,easing:t=>1-Math.pow(1-t,3)}):null;
   snap?.stop();let snapping=false,base=0,range=1,stops:(()=>void)[]=[];
   const resize=()=>{
    stops.forEach(remove=>remove());range=stage.clientHeight;
    base=scrollY+track.getBoundingClientRect().top-header.clientHeight;
    lenis?.resize();stops=chapters.map((_,i)=>snap?.add(base+i*range)||(()=>{}));
   };
   resize();window.addEventListener('resize',resize);
   const reveals=Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
   reveals.forEach((node,index)=>node.style.setProperty('--entrance-delay',`${index%4*.075}s`));
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-visible',entry.isIntersecting)),{threshold:.06});reveals.forEach(node=>observer.observe(node));
   let frame=0,lastProgress=-10,lastHero=-1;
   const draw=(time:number)=>{
    lenis?.raf(time);header.classList.toggle('scrolled',scrollY>45);
    const heroProgress=reduced?0:clamp(scrollY/Math.max(1,hero.clientHeight*.8));
    if(Math.abs(heroProgress-lastHero)>.0002){lastHero=heroProgress;hero.style.setProperty('--hero-progress',String(heroProgress));hero.style.setProperty('--hero-alpha',String(1-heroProgress*.75));}
    const offset=scrollY-base,end=range*(chapters.length-1),inside=offset>=-1&&offset<=end+1;
    if(inside!==snapping){inside?snap?.start():snap?.stop();snapping=inside;}
    const progress=Math.max(0,Math.min(chapters.length-1,offset/range));
    if(Math.abs(progress-lastProgress)>.0002){
     lastProgress=progress;const active=Math.round(progress);
     groups.forEach(({chapter,objects},index)=>{
      const delta=index-progress,distance=Math.min(1,Math.abs(delta)),visibility=1-smooth(distance);
      const stacking=index<=1;
      chapter.style.opacity=String(reduced?(active===index?1:0):stacking?(index===0?1:progress>0?1:0):visibility);
      chapter.style.pointerEvents=active===index?'auto':'none';chapter.inert=active!==index;chapter.setAttribute('aria-hidden',String(active!==index));
      chapter.style.zIndex=String(index+1);
      chapter.style.setProperty('--chapter-y',`${reduced?0:index===1?Math.max(0,delta)*range:index===0?0:delta*Math.min(range*.17,130)}px`);
      chapter.style.setProperty('--chapter-x',`${reduced?0:index===3?delta*110:0}px`);
      chapter.style.setProperty('--chapter-scale',String(reduced?1:index===4?1-distance*.08:1));
      chapter.style.setProperty('--wipe',`${reduced?0:smooth(distance)*100}%`);
      chapter.style.setProperty('--iris',`${reduced?150:(1-smooth(distance))*150}%`);
      objects.forEach((node,position)=>{
       const amount=reduced?0:index===0&&progress<=1?0:clamp((distance-.02)*(1.2+(position%6)*.1));
       node.style.setProperty('--print',`${reduced||index!==1||node.dataset.object!=='media'?0:clamp((Math.max(0,delta)-.04)*(1.45+(position%2)*.25))*100}%`);
       const media=node.dataset.object==='media';
       node.style.setProperty('--object-y',`${amount*(delta<0?-1:1)*(media?32:55+(position%4)*12)}px`);
       node.style.setProperty('--object-opacity',String(1-amount));
       node.style.setProperty('--object-x',`${!media&&position%3===1?amount*-30:0}px`);
      });
     });
     stage.querySelectorAll<HTMLElement>('[data-chapter-link]').forEach((link,index)=>{link.classList.toggle('active',index===active);if(index===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    }
    frame=requestAnimationFrame(draw);
   };
   frame=requestAnimationFrame(draw);
   dispose=()=>{cancelAnimationFrame(frame);observer.disconnect();stops.forEach(remove=>remove());snap?.destroy();lenis?.destroy();window.removeEventListener('resize',resize);};
  };
  setup();preference.addEventListener('change',setup);
  return()=>{preference.removeEventListener('change',setup);dispose();};
 },[]);
}
