import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'});
try{
 const p=await b.newPage();let checks=0;
 await p.route('http://127.0.0.1:5101/**',async route=>{
  const request=route.request();const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, OPTIONS'};
  if(request.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
  const data=request.postDataJSON().data;assert.equal(data.hotelId,'grand-valley');
  if(request.url().endsWith('/publicRooms')){await route.fulfill({json:{result:[{id:'standard',name:'Published standard room',description:'Room details from the lodge.',capacity:2,rate:2500000,facilities:'Desk'}]},headers});return;}
  assert.ok(request.url().endsWith('/publicAvailability'),'Only public read APIs should be called');assert.equal(data.roomTypeId,'standard');assert.equal(data.guestCount,2);checks++;
  await route.fulfill({json:{result:{available:2,total:5000000,deposit:2500000,currency:'NGN',indicative:true}},headers});
 });
 await p.goto('http://127.0.0.1:5194');await p.getByText('Published room details from the lodge.',{exact:false}).waitFor();
 await p.locator('.room-large button').click();assert.match(await p.getByRole('dialog').innerText(),/Room details from the lodge/);await p.keyboard.press('Escape');
 await p.getByLabel('Check in',{exact:true}).fill('2099-01-02');await p.getByLabel('Check out',{exact:true}).fill('2099-01-04');await p.getByRole('button',{name:'Apply',exact:true}).click();await p.getByRole('status').filter({hasText:'Availability checked'}).waitFor();assert.equal(checks,1);assert.match(await p.locator('.booking-gallery').innerText(),/2 available/);
 await p.getByLabel('Guests',{exact:true}).selectOption('3');assert.equal(await p.locator('.room-availability').count(),0);await p.getByRole('button',{name:'Apply',exact:true}).click();await p.getByRole('status').filter({hasText:'Availability checked'}).waitFor();assert.equal(checks,1);assert.match(await p.locator('.booking-gallery').innerText(),/Exceeds room capacity/);
 console.log('Passed mocked public API integration: HMS room catalogue, date/guest payloads, stay prices, capacity checks and stale-result clearing. No real bookings or payments created.');
}finally{await b.close();}
