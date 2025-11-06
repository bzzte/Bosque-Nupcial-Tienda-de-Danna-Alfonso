/* ===== Config ===== */
const MONEDA = 'USD';      // Cambia a 'COP' para mostrar en COP (PayPal sandbox sigue en USD)
const LOCALE = 'es-CO';
const TAX_RATE = 0.00;     // Si deseas, pon 0.19 para simular IVA
const DESCUENTO = 0.00;

/* ===== Dataset con tus imágenes ===== */
const productos = [
  // VESTIDOS
  { id: 1,  nombre: "Princesa Aurora Bosque",   precio: 1299, categoria: "Vestidos",  img: "https://i.pinimg.com/736x/bd/c8/d5/bdc8d5e21007aad45d8c7dfa96d220e6.jpg" },
  { id: 2,  nombre: "Sirena Perla Montaña",     precio: 1499, categoria: "Vestidos",  img: "https://i.pinimg.com/736x/82/fb/a4/82fba457072d1df08ff70295d9800290.jpg" },
  { id: 3,  nombre: "Corte A Magnolia",         precio: 1190, categoria: "Vestidos",  img: "https://i.pinimg.com/1200x/82/b8/31/82b8312e935da077567681aa60313620.jpg" },
  { id: 4,  nombre: "Boho Encaje Silvestre",    precio: 1090, categoria: "Vestidos",  img: "https://i.pinimg.com/736x/cc/c8/be/ccc8be997dc74323e97682d1a0814f08.jpg" },
  { id: 5,  nombre: "Imperio Éter",             precio: 1120, categoria: "Vestidos",  img: "https://i.pinimg.com/1200x/18/46/95/184695c5797c5808140e47e0faca4c1d.jpg" },
  { id: 6,  nombre: "Minimalista Seda Niebla",  precio: 990,  categoria: "Vestidos",  img: "https://i.pinimg.com/736x/b2/19/47/b21947fb1148dd8396789606f102abc6.jpg" },
  { id: 7,  nombre: "Encaje Vintage Abedul",    precio: 1180, categoria: "Vestidos",  img: "https://i.pinimg.com/736x/07/50/d8/0750d80968b8d8af5c4c47d66c52f18e.jpg" },
  { id: 8,  nombre: "Off-Shoulder Estelar",     precio: 1290, categoria: "Vestidos",  img: "https://i.pinimg.com/1200x/c3/f0/d2/c3f0d2f5c091a73dce2829f4a819ccd6.jpg" },

  // ACCESORIOS
  { id: 9,  nombre: "Tiara Luz de Hadas",       precio: 120,  categoria: "Accesorios",img: "https://i.pinimg.com/1200x/33/87/29/33872962233fbe6439ce3baaf6f8d65d.jpg" },
  { id:10,  nombre: "Aretes Perla",             precio: 85,   categoria: "Accesorios",img: "https://i.pinimg.com/1200x/b0/0e/fc/b00efc2fd3523104b0365abd1ec6c83e.jpg" },

  // ZAPATOS
  { id:11,  nombre: "Stilettos Marfil 9cm",     precio: 140,  categoria: "Zapatos",   img: "https://i.pinimg.com/1200x/72/14/b8/7214b88e2bf663a8f3fad60e83b33159.jpg" },
  { id:12,  nombre: "Sandalias Blush 7cm",      precio: 130,  categoria: "Zapatos",   img: "https://i.pinimg.com/1200x/50/7f/c8/507fc8cfbfeab7ef1c280388128f4048.jpg" },

  // VELOS
  { id:13,  nombre: "Velo Catedral Musgo 3m",   precio: 180,  categoria: "Velos",     img: "https://i.pinimg.com/1200x/90/43/30/9043304b57028e138215e7aa6e849a70.jpg" },
  { id:14,  nombre: "Mantilla Encaje Hiedra",   precio: 220,  categoria: "Velos",     img: "https://i.pinimg.com/736x/d2/c1/36/d2c13623cf70aa9ef7254fd7184b6275.jpg" },
];

/* ===== Estado + Selectores ===== */
let carrito = new Map();

const el = {
  contProds: document.getElementById('productos'),
  lista:     document.getElementById('lista-carrito'),
  subtotal:  document.getElementById('subtotal-text'),
  impuestos: document.getElementById('impuestos-text'),
  descuento: document.getElementById('descuento-text'),
  total:     document.getElementById('total-text'),
  cantidad:  document.getElementById('cantidad-carrito'),
  select:    document.getElementById('categoria'),
  btnVaciar: document.getElementById('btn-vaciar'),
  btnFinal:  document.getElementById('btn-finalizar'),
  paypal:    document.getElementById('paypal-button-container'),
  hints:     document.getElementById('hints-vacios'),
  tabs:      document.querySelectorAll('.tab'),
  panels:    document.querySelectorAll('.tab-panel'),
  formCita:  document.getElementById('form-cita'),
  citaOk:    document.getElementById('cita-ok'),
  live:      document.getElementById('live'),
};

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: MONEDA });

/* ===== Render productos ===== */
function renderProductos(lista){
  el.contProds.setAttribute('aria-busy','true');
  el.contProds.innerHTML = '';

  if (!Array.isArray(lista) || lista.length === 0){
    el.hints.style.display = 'block';
    el.hints.innerHTML = '👋 Aún no hay productos. Edita el array <code>productos</code>.';
    el.contProds.setAttribute('aria-busy','false');
    return;
  } else el.hints.style.display = 'none';

  lista.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'producto';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="precio">Precio: <strong>${money.format(Number(p.precio)||0)}</strong></p>
      <button class="button" data-add="${p.id}">Agregar al carrito</button>
    `;
    const img = card.querySelector('img');
    img.addEventListener('error', ()=>{
      img.src = 'https://via.placeholder.com/400x600/0f1512/ffffff?text=Imagen';
      img.alt = p.nombre + ' (imagen no disponible)';
    });
    el.contProds.appendChild(card);
  });

  el.contProds.setAttribute('aria-busy','false');
}

/* ===== Filtro categoría ===== */
function filtrar(){
  const sel = el.select.value;
  const data = sel === 'todos' ? productos : productos.filter(p => String(p.categoria) === sel);
  renderProductos(data);
  localStorage.setItem('filtro_categoria', sel);
}
function cargarFiltro(){
  const f = localStorage.getItem('filtro_categoria');
  if (f) el.select.value = f;
}

/* ===== Carrito ===== */
function persist(){ localStorage.setItem('carrito', JSON.stringify(Array.from(carrito.entries()))); }
function load(){
  const data = localStorage.getItem('carrito');
  if (data){ carrito = new Map(JSON.parse(data)); }
}
function totales(){
  const subtotal = [...carrito.values()].reduce((a,i)=> a + Number(i.precio||0)*Number(i.cantidad||0), 0);
  const desc = Math.min(DESCUENTO, subtotal);
  const base = subtotal - desc;
  const impuestos = +(base * TAX_RATE).toFixed(2);
  const total = +(base + impuestos).toFixed(2);
  const cantidad = [...carrito.values()].reduce((a,i)=> a + Number(i.cantidad||0), 0);
  return { subtotal, descuento: desc, impuestos, total, cantidad };
}
function pintarCarrito(){
  el.lista.innerHTML = '';
  carrito.forEach(it=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${it.nombre} — ${money.format(it.precio)} x ${it.cantidad}</span>
      <div class="qty">
        <button aria-label="Disminuir" data-dec="${it.id}">−</button>
        <span>${it.cantidad}</span>
        <button aria-label="Aumentar" data-inc="${it.id}">+</button>
        <button class="remove" aria-label="Eliminar" data-del="${it.id}">❌</button>
      </div>`;
    el.lista.appendChild(li);
  });
  const {subtotal,descuento,impuestos,total,cantidad} = totales();
  el.subtotal.textContent  = money.format(subtotal);
  el.descuento.textContent = money.format(descuento);
  el.impuestos.textContent = money.format(impuestos);
  el.total.textContent     = money.format(total);
  el.cantidad.textContent  = cantidad;

  el.paypal.style.display = total > 0 ? 'block' : 'none';
  renderPayPal(total);
}
function add(id){
  const p = productos.find(x=> x.id === id);
  if(!p) return alert('Producto no encontrado. Revisa el catálogo.');
  const it = carrito.get(id);
  if (it) it.cantidad++; else carrito.set(id, {...p, cantidad:1});
  persist(); pintarCarrito();
  el.live.textContent = `${p.nombre} añadido al carrito`;
}
function dec(id){
  const it = carrito.get(id); if(!it) return;
  it.cantidad--; if (it.cantidad<=0) carrito.delete(id);
  persist(); pintarCarrito();
}
function del(id){ carrito.delete(id); persist(); pintarCarrito(); }

/* ===== PayPal (sandbox) ===== */
let paypalRenderedTotal = null;
function renderPayPal(total){
  if(!window.paypal) return;
  if(total <= 0){ paypalRenderedTotal=null; el.paypal.innerHTML=''; return; }
  if(paypalRenderedTotal === total && el.paypal.childElementCount > 0) return;

  paypalRenderedTotal = total;
  el.paypal.innerHTML = '';
  paypal.Buttons({
    style:{layout:'vertical', shape:'pill', color:'gold'},
    createOrder:(data,actions)=>actions.order.create({
      purchase_units:[{ amount:{ value: total.toFixed(2), currency_code: MONEDA } }]
    }),
    onApprove:(data,actions)=>actions.order.capture().then(d=>{
      alert(`¡Gracias ${d?.payer?.name?.given_name || 'cliente'}! Pago aprobado.`);
      carrito.clear(); persist(); pintarCarrito();
    }),
    onError:(err)=>{ console.error(err); alert('Error con el pago. Reintenta.'); }
  }).render('#paypal-button-container');
}

/* ===== Pestañas ===== */
function activarTab(nombre){
  el.tabs.forEach(b=> b.classList.toggle('active', b.dataset.tab===nombre));
  el.panels.forEach(p=>{
    p.classList.toggle('is-visible', p.id === 'tab-' + nombre);
  });
  localStorage.setItem('tab_activa', nombre);
}
document.addEventListener('click', (e)=>{
  const t = e.target.closest('.tab');
  if(t){ activarTab(t.dataset.tab); }
});

/* ===== Eventos ===== */
document.addEventListener('click', e=>{
  const addBtn=e.target.closest('[data-add]'); if(addBtn) add(+addBtn.dataset.add);
  const incBtn=e.target.closest('[data-inc]'); if(incBtn) add(+incBtn.dataset.inc);
  const decBtn=e.target.closest('[data-dec]'); if(decBtn) dec(+decBtn.dataset.dec);
  const delBtn=e.target.closest('[data-del]'); if(delBtn) del(+delBtn.dataset.del);

  const servBtn=e.target.closest('[data-servicio]');
  if(servBtn){
    const t=servBtn.dataset.servicio;
    const msg = t==='maquillaje' ? 'Te contactaremos para maquillaje & peinado 💄'
              : t==='catering'   ? 'Te enviaremos menús y cotización de catering 🍽️'
              : 'Compartiremos portafolio y paquetes 📸';
    alert(msg);
  }
});
document.getElementById('categoria').addEventListener('change', filtrar);
document.getElementById('btn-vaciar').addEventListener('click', ()=>{ if(confirm('¿Vaciar carrito?')){ carrito.clear(); persist(); pintarCarrito(); }});
document.getElementById('btn-finalizar').addEventListener('click', ()=>{
  if(carrito.size===0) return alert('Carrito vacío.');
  alert('Pedido confirmado (simulado). ¡Gracias por tu compra!');
  carrito.clear(); persist(); pintarCarrito();
});

/* ===== Formulario de citas ===== */
el.formCita.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const fd = new FormData(el.formCita);
  const cita = Object.fromEntries(fd.entries());
  if(!cita.nombre || !cita.email || !cita.telefono || !cita.fecha || !cita.hora || !document.getElementById('cita-contacto').checked){
    return alert('Completa todos los campos obligatorios y acepta el contacto.');
  }
  const citasPrev = JSON.parse(localStorage.getItem('citas')||'[]');
  citasPrev.push({...cita, ts: Date.now()});
  localStorage.setItem('citas', JSON.stringify(citasPrev));
  el.citaOk.style.display='block';
  el.formCita.reset();
});

/* ===== Init ===== */
(function init(){
  cargarFiltro(); filtrar();     // Productos y filtro
  load(); pintarCarrito();       // Carrito
  const last = localStorage.getItem('tab_activa') || 'productos';
  activarTab(last);              // Restaurar pestaña
  document.getElementById('main')?.focus({preventScroll:true});
})();
