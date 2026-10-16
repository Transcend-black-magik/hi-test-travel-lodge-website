import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.WEBSITE_TEST_URL||'http://127.0.0.1:5192');
 const delays=await p.locator('.welcome-line,.hotel-line,.welcome-bottom p,.welcome-bottom .black-pill,.arrival-photo>img').evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).animationDelay)));
 assert.equal(delays.length,5);assert.ok(delays.every((value,index)=>index===0||value>delays[index-1]),'Hero elements must enter independently in sequence');
 assert.equal(await p.locator('video').count(),0);assert.equal(await p.locator('.comfort-showcase').count(),1);
 const first=await p.locator('.room-large .room-caption').innerText();await p.getByRole('button',{name:'Next rooms',exact:true}).click();assert.notEqual(await p.locator('.room-large .room-caption').innerText(),first);
 await p.locator('.room-large button').click();assert.match(await p.getByRole('dialog').innerText(),/illustrative room preview/);await p.keyboard.press('Escape');
 await p.getByLabel('Check in',{exact:true}).fill('2099-01-02');await p.getByLabel('Check out',{exact:true}).fill('2099-01-04');await p.getByRole('button',{name:'Apply',exact:true}).click();assert.match(await p.getByRole('status').innerText(),/coming soon/);
 for(const width of[320,390,768,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width}`);}
 await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Toggle navigation'}).click();assert.equal(await p.getByRole('navigation').isVisible(),true);await p.getByRole('navigation').getByRole('link',{name:'Rooms',exact:true}).click();assert.equal(await p.getByRole('navigation').isVisible(),false);
 await p.getByRole('button',{name:'Login',exact:true}).click();assert.match(await p.getByRole('dialog').innerText(),/Welcome back|Customer services/);await p.keyboard.press('Escape');
 assert.deepEqual(errors,[]);await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'test-results/editorial-mobile.png',fullPage:true});
 console.log('Passed: editorial layout, room carousel, preview dialogs, booking form, mobile navigation and responsive overflow.');
}finally{await browser.close();}
