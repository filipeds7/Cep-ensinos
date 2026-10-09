const SUPABASE_URL = "https://kjkmnaktjbozzuofqswm.supabase.co";
const SUPABASE_KEY = "sb_publishable_yzMrTDwiN_RvXTipaemPRw_We2BBZ41";

async function supabaseRequest(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase: ${response.status}`);
  }

  return response.json();
}

function setupMenu(){
  const btn=document.querySelector(".menu");
  const nav=document.querySelector("nav");
  if(!btn||!nav)return;
  btn.addEventListener("click",()=>{
    nav.classList.toggle("open");
    nav.style.display = nav.classList.contains("open") ? "flex" : "";
    if(nav.classList.contains("open")){
      nav.style.position="absolute";nav.style.top="70px";nav.style.left="0";nav.style.right="0";
      nav.style.background="#05090b";nav.style.padding="18px 6%";nav.style.flexDirection="column";nav.style.gap="5px";
      nav.querySelectorAll("a").forEach(a=>a.style.padding="13px 0");
    }
  });
}

function renderCourseCard(c) {
  const card = document.createElement("a");
  card.className = "card";
  card.href = `curso.html?curso=${encodeURIComponent(c.slug)}`;
  card.innerHTML = `
    <img src="${c.imagem || "assets/hero.svg"}" alt="Curso de ${c.nome}">
    <div class="card-body">
      <h3>${c.nome.toUpperCase()}</h3>
      <p>${c.descricao_curta || c.descricao || "Confira os detalhes deste curso."}</p>
      <span class="card-link">VER CURSO <b>→</b></span>
    </div>
  `;
  return card;
}

async function loadCoursesHome() {
  const container = document.querySelector(".courses");
  if (!container) return;

  try {
    const courses = await supabaseRequest(
      "cursos?select=slug,nome,descricao,descricao_curta,imagem&ativo=eq.true&order=id.asc"
    );

    container.innerHTML = "";

    courses.forEach(course => {
      container.appendChild(renderCourseCard(course));
    });

    if (!courses.length) {
      container.innerHTML = '<p style="color:#b7c0c5;text-align:center;grid-column:1/-1">Nenhum curso disponível no momento.</p>';
    }
  } catch (error) {
    console.error("Erro ao carregar cursos do Supabase:", error);
    container.innerHTML = '<p style="color:#b7c0c5;text-align:center;grid-column:1/-1">Não foi possível carregar os cursos.</p>';
  }
}

function brl(n){return Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}

function renderCourseHeading(el,nome){
  const words=String(nome).trim().split(/\s+/);
  el.textContent="";
  if(words.length<2){el.textContent=nome;return;}
  el.append(words.slice(0,-1).join(" ")+" ");
  const em=document.createElement("em");
  em.textContent=words[words.length-1];
  el.appendChild(em);
}

function renderPrice(c){
  const preco=Number(c.preco);
  if(!c.preco||!isFinite(preco)||preco<=0)return;
  const [int,cents]=brl(preco).split(",");
  document.querySelector("[data-price-int]").textContent=int;
  document.querySelector("[data-price-cents]").textContent=","+cents;
  const n=parseInt(c.parcelas,10);
  const sub=document.querySelector("[data-price-sub]");
  if(n>1){
    sub.innerHTML=`ou <b>${n}x de R$ ${brl(preco/n)}</b> no cartão`;
    const cta=document.querySelector("[data-cta-sub]");
    if(cta)cta.textContent=`Vagas limitadas por turma. ${n}x no cartão.`;
  }
  document.querySelector("[data-price-box]").hidden=false;
  document.querySelector("[data-price-consult]").hidden=true;
}

function renderTopics(c){
  const box=document.querySelector("[data-topics]");
  if(!box||!c.topicos)return;
  // Um tópico por linha, no formato "Título | descrição"
  const items=String(c.topicos).split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(!items.length)return;
  items.forEach(line=>{
    const [t,d]=line.split("|").map(x=>x.trim());
    const el=document.createElement("div");el.className="topic";
    const inner=document.createElement("div");
    const b=document.createElement("b");b.textContent=t;inner.appendChild(b);
    if(d){const sp=document.createElement("span");sp.textContent=d;inner.appendChild(sp);}
    el.appendChild(inner);box.appendChild(el);
  });
  box.hidden=false;
}

async function fetchCourse(key){
  const base="slug,nome,descricao,imagem,carga_horaria,certificado,modalidade,link_compra";
  const build=select=>`cursos?${new URLSearchParams({select,slug:`eq.${key}`,ativo:"eq.true",limit:"1"})}`;
  try {
    // Primeiro tenta todos os campos opcionais.
    return (await supabaseRequest(build(base+",descricao_curta,preco,parcelas,topicos")))[0];
  } catch (e) {
    // Se parcelas ou topicos não existirem, ainda tenta carregar o preço.
    try {
      return (await supabaseRequest(build(base+",descricao_curta,preco")))[0];
    } catch (e2) {
      // Compatibilidade com bancos que ainda não possuem os campos novos.
      return (await supabaseRequest(build(base)))[0];
    }
  }
}

async function loadCoursePage() {
  const key = new URLSearchParams(location.search).get("curso");
  if (!key || !document.querySelector("[data-course-title]")) return;

  try {
    const c = await fetchCourse(key);

    if (!c) {
      document.title = "Curso não encontrado | CEP Ensino";
      document.querySelectorAll("[data-course-title]").forEach(e => e.textContent = "Curso não encontrado");
      document.querySelectorAll("[data-course-heading]").forEach(e => e.textContent = "Curso não encontrado");
      document.querySelectorAll("[data-course-short],[data-course-description]").forEach(e => e.textContent = "Este curso não está disponível no momento.");
      return;
    }

    document.title=`${c.nome} | CEP Ensino`;
    document.querySelectorAll("[data-course-title]").forEach(e=>e.textContent=c.nome);
    document.querySelectorAll("[data-course-heading]").forEach(e=>renderCourseHeading(e,c.nome));
    document.querySelectorAll("[data-course-image]").forEach(e=>{
      e.src=c.imagem || "assets/hero.png";
      e.alt=`Curso de ${c.nome}`;
    });
    document.querySelectorAll("[data-course-short]").forEach(e=>e.textContent=c.descricao_curta || c.descricao || "");
    document.querySelectorAll("[data-course-description]").forEach(e=>e.textContent=c.descricao || "");
    document.querySelectorAll("[data-workload]").forEach(e=>e.textContent=c.carga_horaria || "—");
    document.querySelectorAll("[data-certificate]").forEach(e=>e.textContent=c.certificado || "—");
    document.querySelectorAll("[data-access]").forEach(e=>e.textContent=c.modalidade || "—");
    document.querySelectorAll("[data-chip-access]").forEach(e=>e.textContent=c.modalidade || "Presencial");
    const mensagem = `Olá, gostaria de me inscrever no curso de ${c.nome}.`;
    const linkWhatsApp = `https://wa.me/5553999708464?text=${encodeURIComponent(mensagem)}`;
    document.querySelectorAll("[data-buy]").forEach(e=>{
      e.href = linkWhatsApp;
      e.target = "_blank";
      e.rel = "noopener";
    });
    renderPrice(c);
    renderTopics(c);
  } catch (error) {
    console.error("Erro ao carregar curso do Supabase:", error);
    document.querySelectorAll("[data-course-short],[data-course-description]").forEach(e=>e.textContent="Não foi possível carregar os dados deste curso.");
  }
}

setupMenu();
loadCoursesHome();
loadCoursePage();
