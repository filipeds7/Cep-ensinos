
const courses = {
  "eletrica-predial": {
    title:"Elétrica Predial",
    image:"assets/eletrica-predial.svg",
    description:"Aprenda a instalar e manter sistemas elétricos em residências e comércios, com foco em segurança, prática e organização.",
    workload:"40 horas",
    certificate:"Sim",
    access:"Presencial",
    buy:"#"
  },
  "eletrica-industrial": {
    title:"Elétrica Industrial",
    image:"assets/eletrica-industrial.svg",
    description:"Capacite-se para atuar em instalações elétricas industriais, manutenção e procedimentos com foco em segurança e eficiência.",
    workload:"40 horas",
    certificate:"Sim",
    access:"Presencial",
    buy:"#"
  },
  "ar-condicionado": {
    title:"Ar Condicionado",
    image:"assets/ar-condicionado.svg",
    description:"Aprenda a instalar, manter e fazer a manutenção de sistemas de climatização, desenvolvendo uma habilidade valorizada no mercado.",
    workload:"40 horas",
    certificate:"Sim",
    access:"Presencial",
    buy:"#"
  }
};

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
setupMenu();

const key=new URLSearchParams(location.search).get("curso");
if(key && courses[key]){
  const c=courses[key];
  document.title=`${c.title} | CEP Ensino`;
  document.querySelectorAll("[data-course-title]").forEach(e=>e.textContent=c.title);
  document.querySelectorAll("[data-course-image]").forEach(e=>e.src=c.image);
  document.querySelectorAll("[data-course-description]").forEach(e=>e.textContent=c.description);
  document.querySelectorAll("[data-workload]").forEach(e=>e.textContent=c.workload);
  document.querySelectorAll("[data-certificate]").forEach(e=>e.textContent=c.certificate);
  document.querySelectorAll("[data-access]").forEach(e=>e.textContent=c.access);
  document.querySelectorAll("[data-buy]").forEach(e=>e.href=c.buy);
}
