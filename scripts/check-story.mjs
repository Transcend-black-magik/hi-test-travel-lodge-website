import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
try{
 const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.WEBSITE_TEST_URL||'http://127.0.0.1:5193');await p.evaluate(()=>document.fonts.ready);
 const metrics=()=>p.evaluate(()=>({header:document.querySelector('.lodge-header').clientHeight,range:document.querySelector('.chapter-stage').clientHeight,base:scrollY+document.querySelector('.chapter-track').getBoundingClientRect().top-document.querySelector('.lodge-header').clientHeight}));
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,1000],[667,375]]){
  await p.setViewportSize({width,height});await p.waitForTimeout(100);const {base,range,header}=await metrics();
  for(let index=0;index<5;index++){
   await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),base+index*range);await p.waitForTimeout(100);
   assert.equal(await p.locator(`[data-chapter="${index}"]`).getAttribute('aria-hidden'),'false',`Active chapter ${index} at ${width}`);
   assert.ok(await p.locator('.chapter-stage').evaluate((e,h)=>Math.abs(e.getBoundingClientRect().top-h)<2,header));
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width}`);
   const escaped=await p.locator(`[data-chapter="${index}"] h2`).evaluateAll(elements=>elements.filter(el=>el.getBoundingClientRect().bottom>innerHeight).length);assert.equal(escaped,0,`Heading clipped chapter ${index} at ${width}`);
  }
  await p.locator('#location').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>document.querySelector('.chapter-stage').getBoundingClientRect().bottom<innerHeight),'Story must release into editorial content');
 }
 await p.setViewportSize({width:1440,height:1000});await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(150);let {base,range}=await metrics();await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),base);await p.waitForTimeout(150);
 await p.mouse.move(500,350);await p.mouse.wheel(0,range*.7);await p.waitForTimeout(180);const stacked=await p.locator('[data-chapter="1"]').evaluate(e=>({opacity:Number(e.style.opacity),y:parseFloat(e.style.getPropertyValue('--chapter-y'))}));assert.equal(stacked.opacity,1);assert.ok(stacked.y>0&&stacked.y<range,'02 should slide over 01');assert.equal(await p.locator('[data-chapter="0"]').evaluate(e=>Number(e.style.opacity)),1);
 await p.waitForTimeout(2000);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-(base+range))<2,'Snap should settle on 02');
 await p.mouse.wheel(0,-range*.7);await p.waitForTimeout(2300);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-base)<2,'Reverse snap should return to 01');
 await p.locator('#chapter-gallery').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(100);assert.equal(await p.locator('[data-chapter="3"]').getAttribute('aria-hidden'),'false');
 assert.equal(await p.locator('.chapter-media img[style]').count(),0,'Media and wrapper must not animate separately');assert.deepEqual(errors,[]);
 console.log('Passed: five pinned chapters, snap positions, forward/reverse blend, distinct 04/05 masks, editorial release, media grouping, responsive layouts and reduced motion.');
}finally{await browser.close();}
