/* Demo data is stored in browser LocalStorage. This will later be replaced with PHP/MySQL.
   Each key below (packages, bookings, users) maps to one future MySQL table; "id" = primary key. */
const DB={
 packages:[
  {id:1,name:"Basic",price:5000,category:"Birthday",status:"Active",features:["Simple backdrop","Balloon decoration","Table decoration","Basic lighting","2-hour setup"]},
  {id:2,name:"Standard",price:10000,category:"Engagement",status:"Active",popular:true,features:["Premium backdrop","Balloon decoration","Flower decoration","Table decoration","Decorative lighting","4-hour setup"]},
  {id:3,name:"Premium",price:20000,category:"Wedding",status:"Active",features:["Luxury backdrop","Premium flowers","Stage decoration","Entrance decoration","Premium lighting","Customized theme","Full event support"]}],
 bookings:[
  {id:"ED-2026-00125",customer:"Rahul Kumar",email:"customer@eventdecor.com",event:"Wedding",package:"Premium",date:"2026-11-15",location:"Kannur",amount:20000,status:"Approved"},
  {id:"ED-2026-00120",customer:"Rahul Kumar",email:"customer@eventdecor.com",event:"Birthday",package:"Standard",date:"2026-10-28",location:"Kannur",amount:10000,status:"Pending"},
  {id:"ED-2026-00098",customer:"Rahul Kumar",email:"customer@eventdecor.com",event:"Engagement",package:"Premium",date:"2026-09-10",location:"Kannur",amount:20000,status:"Completed"},
  {id:"ED-2026-00110",customer:"Anjali Menon",email:"anjali@example.com",event:"Baby Shower",package:"Basic",date:"2026-11-02",location:"Kochi",amount:5000,status:"Pending"},
  {id:"ED-2026-00104",customer:"Fathima Nasar",email:"fathima@example.com",event:"Wedding",package:"Premium",date:"2026-12-05",location:"Thalassery",amount:20000,status:"Approved"}],
 users:[
  {id:1,name:"Rahul Kumar",email:"customer@eventdecor.com",password:"123456",role:"customer"},
  {id:2,name:"EventDecor Admin",email:"admin@eventdecor.com",password:"admin123",role:"admin"}]
};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>"₹"+Number(n).toLocaleString("en-IN");
const store={get(k){try{return JSON.parse(localStorage.getItem("ed_"+k))}catch(e){return null}},
 set(k,v){localStorage.setItem("ed_"+k,JSON.stringify(v))},
 init(){for(const k in DB)if(!this.get(k))this.set(k,DB[k])}};
store.init();
const ROOT=document.body.dataset.root||"",PAGE=document.body.dataset.page,session=()=>store.get("session");
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)}
function modal(html){const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="box">${html}<p><button class="btn" data-x>Close</button></p></div>`;
 m.onclick=e=>{if(e.target===m||e.target.dataset.x!==undefined)m.remove()};document.body.append(m)}
function logout(){localStorage.removeItem("ed_session");location.href=ROOT+"index.html"}

/* Shared header + footer (later: PHP include files header.php / footer.php) */
function layout(){
 const s=session(),admin=ROOT==="../";
 const links=admin?[["bookings.html","Bookings"]]:[["index.html","Home"],["packages.html","Packages"],["booking.html","Book Event"],["my-bookings.html","My Bookings"]];
 links.push(s?["#","Logout"]:["login.html","Login"]);
 document.body.insertAdjacentHTML("afterbegin",`<header class="nav"><div class="wrap"><a class="logo" href="${ROOT}index.html">Event<b>Decor</b></a>
 <button id="burger" aria-label="Menu">☰</button><nav id="menu">${links.map(l=>`<a href="${l[0]}" ${l[1]==="Logout"?"data-out":""}>${l[1]}</a>`).join("")}</nav></div></header>`);
 document.body.insertAdjacentHTML("beforeend",`<footer><div class="wrap"><p class="logo" style="color:#fff">Event<b>Decor</b></p><p>We Create Moments. You Celebrate Memories.</p><p>Kannur, Kerala · hello@eventdecor.com · © 2026 EventDecor</p></div></footer>`);
 $("#burger").onclick=()=>$("#menu").classList.toggle("open");
 const o=$("[data-out]");if(o)o.onclick=e=>{e.preventDefault();logout()};
}
layout();
const pkgCards=list=>list.map(p=>`<article class="card">${p.popular?'<span class="badge">MOST POPULAR</span>':""}<div class="art"></div><div class="body"><h3>${p.name}</h3><p class="price">${money(p.price)}</p><ul>${p.features.map(f=>`<li>${f}</li>`).join("")}</ul>
 <button class="btn alt" data-view="${p.id}">View Details</button> <a class="btn" href="booking.html?pkg=${p.id}">Book Now</a></div></article>`).join("");
document.addEventListener("click",e=>{const id=e.target.dataset.view;if(!id)return;const p=store.get("packages").find(x=>x.id==id);
 modal(`<h3>${p.name} Package</h3><p class="price">${money(p.price)}</p><p>Best for: ${p.category}</p><ul>${p.features.map(f=>`<li>${f}</li>`).join("")}</ul>`)});

const pages={
 home(){$("#pkgGrid").innerHTML=pkgCards(store.get("packages").filter(p=>p.status==="Active"))},
 packages(){const draw=()=>{const c=$("#fCat").value,all=store.get("packages").filter(p=>p.status==="Active"&&(!c||p.category===c));
   $("#pkgGrid").innerHTML=all.length?pkgCards(all):"<p>No packages match this filter.</p>"};$("#fCat").onchange=draw;draw()},
 login(){$("#lf").onsubmit=e=>{e.preventDefault();const role=document.body.dataset.role,em=$("#email").value.trim(),pw=$("#pw").value;
   const u=store.get("users").find(x=>x.email===em&&x.password===pw&&x.role===role);
   if(!u){$("#err").textContent="Email or password is incorrect. Check the demo credentials below the form.";return}
   store.set("session",u);location.href=role==="admin"?"bookings.html":"my-bookings.html"}},
 booking(){const pk=store.get("packages").filter(p=>p.status==="Active");
  $("#pkg").innerHTML=pk.map(p=>`<option value="${p.id}">${p.name} - ${money(p.price)}</option>`).join("");
  const q=new URLSearchParams(location.search).get("pkg");if(q)$("#pkg").value=q;
  $("#date").min=new Date().toISOString().slice(0,10);
  const s=session();if(s){$("#name").value=s.name;$("#email").value=s.email}
  const calc=()=>{const p=pk.find(x=>x.id==$("#pkg").value);let t=p.price,r=`<p>${p.name} package <b>${money(t)}</b></p>`;
   $$(".svc:checked").forEach(c=>{t+=+c.dataset.price;r+=`<p>${c.value} <b>${money(c.dataset.price)}</b></p>`});
   $("#sum").innerHTML=r+`<p class="total">Estimated total <b>${money(t)}</b></p>`;return t};
  $("#bf").oninput=calc;calc();
  $("#bf").onsubmit=e=>{e.preventDefault();if(!e.target.checkValidity()){e.target.reportValidity();return}
   const all=store.get("bookings"),n=Math.max(...all.map(b=>+b.id.slice(-5)))+1,id="ED-2026-"+String(n).padStart(5,"0");
   all.push({id,customer:$("#name").value,email:$("#email").value,event:$("#event").value,package:pk.find(x=>x.id==$("#pkg").value).name,date:$("#date").value,location:$("#addr").value,amount:calc(),status:"Pending"});
   store.set("bookings",all);modal(`<h3>Booking Request Submitted Successfully!</h3><p>Your booking ID is <b>${id}</b>.</p><p>Status: <span class="st Pending">Pending Approval</span></p>`);e.target.reset();calc()}},
 mybookings(){const s=session();if(!s){location.href="login.html";return}
  const draw=()=>{const q=$("#q").value.toLowerCase(),st=$("#fSt").value,
   l=store.get("bookings").filter(b=>b.email===s.email&&(!st||b.status===st)&&(b.id+b.event+b.package).toLowerCase().includes(q));
   $("#list").innerHTML=l.length?l.map(b=>`<article class="card"><div class="body"><span class="st ${b.status}">${b.status}</span><h3>${b.event} · ${b.package}</h3><p>${b.id}<br>${b.date} · ${b.location}</p><p class="price">${money(b.amount)}</p></div></article>`).join(""):"<p>No bookings found. Clear the filters or <a href='booking.html'>book an event</a>.</p>"};
  $("#q").oninput=draw;$("#fSt").onchange=draw;draw()},
 adminbookings(){const s=session();if(!s||s.role!=="admin"){location.href="login.html";return}
  const draw=()=>{$("#rows").innerHTML=store.get("bookings").map(b=>`<tr><td data-label="ID">${b.id}</td><td data-label="Customer">${b.customer}</td><td data-label="Event">${b.event}</td><td data-label="Package">${b.package}</td><td data-label="Date">${b.date}</td><td data-label="Amount">${money(b.amount)}</td><td data-label="Status"><span class="st ${b.status}">${b.status}</span></td>
   <td class="acts">${b.status==="Pending"?`<button data-a="Approved" data-id="${b.id}">Approve</button><button data-a="Rejected" data-id="${b.id}">Reject</button>`:""}<button data-a="del" data-id="${b.id}">Delete</button></td></tr>`).join("")};
  $("#rows").onclick=e=>{const a=e.target.dataset.a,id=e.target.dataset.id;if(!a||!confirm(a==="del"?"Delete this booking?":a+" this booking?"))return;
   let l=store.get("bookings");l=a==="del"?l.filter(b=>b.id!==id):l.map(b=>b.id===id?{...b,status:a}:b);store.set("bookings",l);draw();toast("Booking updated")};draw()}
};
pages[PAGE]&&pages[PAGE]();
