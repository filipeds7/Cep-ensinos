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
      <p>${c.descricao || "Confira os detalhes deste curso."}</p>
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
      "cursos?select=slug,nome,descricao,imagem&ativo=eq.true&order=id.asc"
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

async function loadCoursePage() {
  const key = new URLSearchParams(location.search).get("curso");
  if (!key || !document.querySelector("[data-course-title]")) return;

  try {
    const params = new URLSearchParams({
      select: "slug,nome,descricao,imagem,carga_horaria,certificado,modalidade,link_compra",
      slug: `eq.${key}`,
      ativo: "eq.true",
      limit: "1"
    });

    const courses = await supabaseRequest(`cursos?${params.toString()}`);
    const c = courses[0];

    if (!c) {
      document.title = "Curso não encontrado | CEP Ensino";
      document.querySelectorAll("[data-course-title]").forEach(e => e.textContent = "Curso não encontrado");
      document.querySelectorAll("[data-course-description]").forEach(e => e.textContent = "Este curso não está disponível no momento.");
      return;
    }

    document.title=`${c.nome} | CEP Ensino`;
    document.querySelectorAll("[data-course-title]").forEach(e=>e.textContent=c.nome);
    document.querySelectorAll("[data-course-image]").forEach(e=>{
      e.src=c.imagem || "assets/hero.svg";
      e.alt=`Curso de ${c.nome}`;
    });
    document.querySelectorAll("[data-course-description]").forEach(e=>e.textContent=c.descricao || "");
    document.querySelectorAll("[data-workload]").forEach(e=>e.textContent=c.carga_horaria || "—");
    document.querySelectorAll("[data-certificate]").forEach(e=>e.textContent=c.certificado || "—");
    document.querySelectorAll("[data-access]").forEach(e=>e.textContent=c.modalidade || "—");
    document.querySelectorAll("[data-buy]").forEach(e=>e.href=c.link_compra || "#");
  } catch (error) {
    console.error("Erro ao carregar curso do Supabase:", error);
    document.querySelectorAll("[data-course-description]").forEach(e=>e.textContent="Não foi possível carregar os dados deste curso.");
  }
}

setupMenu();
loadCoursesHome();
loadCoursePage();
