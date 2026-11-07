/* CAD kinematic sequence. No force/dynamics simulation. Millimetres/degrees. */
(function(root){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*clamp(t,0,1);
 // Contact angle from the front panel plane at the disk's top surface.
 function entryFlap(nose){const b=-(nose+3.8+.15);return clamp((Math.asin(1.9/Math.hypot(3.4,b))-Math.atan2(b,3.4))*180/Math.PI,0,83.5)}
 function pose(p){p=clamp(p,0,100);let disk=0,button=0,flap=0,latch=0,phase='Seated · latch engaged';
  if(p<45){disk=mix(-114,0,p/45);latch=disk<-.2?2.8:0;phase='Insert · keeper holds latch clear';const nose=106+disk;flap=entryFlap(nose);if(disk>-.6)flap=83.5*clamp(-disk/.6,0,1)}
  else if(p<55){}
  else if(p<70){button=mix(0,6,(p-55)/15);flap=88*clamp(button/3.5,0,1);latch=clamp((button-3.97)*5/3,0,2.8);phase=button<3.5?'Press eject · flap opens first':button<3.97?'Flap open · latch still engaged':'Release · cam retracts latch'}
  else if(p<85){disk=mix(0,-28,(p-70)/15);button=6;flap=88;latch=2.8;phase='Spring eject · disk moves out'}
  else if(p<90){disk=-28;button=mix(6,0,(p-85)/5);flap=button>3.5?88:mix(88,83.5,(3.5-button)/3.5);latch=2.8;phase='Button returns · flap rests on disk'}
  else{disk=mix(-28,-114,(p-90)/10);latch=2.8;flap=entryFlap(106+disk);phase='Remove disk · flap closes'}
  return {disk,button,flap,latch,carriage:Math.max(-28,disk),phase};
 }
 root.CyberDriveMotion={pose};if(typeof module!=='undefined')module.exports={pose};
})(typeof window==='undefined'?globalThis:window);
