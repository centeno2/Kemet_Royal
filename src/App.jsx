import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Columns3,
  Eye,
  MapPin,
  Menu,
  Mouse,
  Sparkles,
  Utensils,
  Waves,
  X,
} from "lucide-react";
import { Lotus, Star, Sun, WingedSun } from "./components/Symbols";
import ReservationModal from "./components/ReservationModal";
import { useReducedMotion, useReveal, useSectionProgress } from "./hooks";

const ModelViewer = lazy(() => import("./components/ModelViewer"));
const navItems = [
  { id: "concepto", label: "El concepto" },
  { id: "arquitectura", label: "Arquitectura" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "experiencia", label: "La experiencia" },
];
const artifacts = [
  {
    model: "statue",
    name: "La estatua",
    caption: "Guardianes de un legado eterno",
    numeral: "I",
  },
  {
    model: "eye",
    name: "Ojo de Horus",
    caption: "El símbolo de la protección",
    numeral: "II",
  },
  {
    model: "pyramid",
    name: "La pirámide",
    caption: "La geometría de lo sagrado",
    numeral: "III",
  },
  {
    model: "papyrus",
    name: "El papiro",
    caption: "Historias que trascienden el tiempo",
    numeral: "IV",
  },
];
const stages = [
  {
    title: "El curso del Nilo",
    subtitle: "AGUA · TIERRA · VIDA",
    text: "Espejos de agua, fuentes escalonadas en cascada y palmeras datileras recrean el ecosistema fértil del río Nilo. El viaje comienza antes de cruzar el umbral.",
    icon: Waves,
  },
  {
    title: "Un templo para los sentidos",
    subtitle: "PIEDRA · PROPORCIÓN · GRANDEZA",
    text: "Muros en talud de piedra arenisca y columnas de capiteles papiriformes y lotiformes evocan los pilonos de acceso a los templos tebanos.",
    icon: Columns3,
  },
  {
    title: "Coronado por la luz",
    subtitle: "BASALTO · ORO · LUZ",
    text: "El piramidión dorado acristalado ilumina el interior. Bajo tus pies, el basalto negro con incrustaciones áureas dibuja el curso de nuestro río sagrado.",
    icon: Sun,
  },
];
const rituals = [
  {
    title: "El umbral",
    eyebrow: "EL ARTE DE RECIBIRTE",
    icon: Lotus,
    text: "Tu velada comienza con un ritual de recepción y purificación: agua tibia perfumada con esencia de loto y azahar, vertida delicadamente sobre tus manos.",
    detail: "Loto & azahar",
  },
  {
    title: "El festín",
    eyebrow: "UNA HISTORIA EN CADA PLATO",
    icon: Utensils,
    text: "Un papiro de ofrendas revela tu banquete. Cada platillo llega acompañado de la fascinante mitología que lo inspira, relatada por quienes te sirven.",
    detail: "Sabores & relatos",
  },
  {
    title: "La atmósfera",
    eyebrow: "LOS CINCO SENTIDOS",
    icon: Sun,
    text: "Salones privados y un Salón Ceremonial Hipóstilo. Luz cálida rasante, mirra e incienso natural, y un paisaje sonoro de arpas y laúdes envuelven tu noche.",
    detail: "Armonía & misticismo",
  },
  {
    title: "El sello real",
    eyebrow: "UN FINAL EXTRAORDINARIO",
    icon: Sparkles,
    text: "Un cofre de madera laqueada, sellado con cera roja, presenta la cuenta. Nos despedimos con una infusión fría de karkadé y escamas de oro comestible.",
    detail: "Karkadé & oro",
  },
];

function Scene(props) {
  return (
    <Suspense
      fallback={
        <div className={`model-viewer ${props.className || ""}`}>
          <img
            className="scene-poster"
            src={`/models/${props.model || "temple"}-poster.webp`}
            alt={props.label || "Vista de Kemet Royal"}
          />
        </div>
      }
    >
      <ModelViewer {...props} />
    </Suspense>
  );
}

function tabKeys(event) {
  const buttons = [...event.currentTarget.querySelectorAll("[role=tab]")];
  const current = buttons.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
  else if (event.key === "ArrowLeft")
    next = (current - 1 + buttons.length) % buttons.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = buttons.length - 1;
  else return;
  event.preventDefault();
  buttons[next].focus();
  buttons[next].click();
}

function Architecture() {
  const ref = useRef(null);
  const progress = useSectionProgress(ref);
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(null);
  const lastProgress = useRef(progress);
  useEffect(() => {
    if (Math.abs(progress - lastProgress.current) > 0.015) {
      setSelected(null);
      lastProgress.current = progress;
    }
  }, [progress]);
  const stage = selected ?? Math.min(2, Math.floor(progress * 3));
  const construction =
    selected !== null
      ? [0.29, 0.72, 1][selected]
      : Math.min(1, 0.12 + progress * 1.2);
  const Icon = stages[stage].icon;
  return (
    <section
      ref={ref}
      id="arquitectura"
      className="architecture-scroll"
      aria-labelledby="architecture-title"
    >
      <div className="architecture-sticky">
        <div className="section-heading architecture-heading">
          <span className="eyebrow gold">
            <span className="tiny-line" /> 02 / ARQUITECTURA & PAISAJISMO
          </span>
          <h2 id="architecture-title">
            La grandeza toma <em>forma.</em>
          </h2>
          <p>Un templo contemporáneo. Un legado de miles de años.</p>
        </div>
        <div className="architecture-layout content-width">
          <div className="construction-stage">
            <span className="model-caption">
              <span className="live-dot" /> EL REINO, CAPA A CAPA
            </span>
            <div className="construction-orbit" />
            <Scene
              model="temple"
              className="construction-viewer"
              dark
              construction={construction}
              label="Construcción progresiva del complejo Kemet Royal"
            />
            <span className="construction-progress">
              <span>VISIÓN ARQUITECTÓNICA</span>
              <span>{String(stage + 1).padStart(2, "0")} / 03</span>
            </span>
          </div>
          <div className="architecture-story">
            <div
              className="stage-tabs"
              role="tablist"
              onKeyDown={tabKeys}
              aria-label="Etapas de la arquitectura"
            >
              {stages.map((item, index) => (
                <button
                  role="tab"
                  tabIndex={stage === index ? 0 : -1}
                  aria-label={`Etapa ${index + 1}: ${item.title}`}
                  aria-selected={stage === index}
                  aria-controls="architecture-panel"
                  id={`stage-${index}`}
                  key={item.title}
                  onClick={() => setSelected(index)}
                >
                  <span>0{index + 1}</span>
                  <span className="stage-tab-line" />
                </button>
              ))}
            </div>
            <div
              id="architecture-panel"
              className="stage-description"
              role="tabpanel"
              aria-labelledby={`stage-${stage}`}
              key={stage}
            >
              <Icon className="stage-icon" size={35} />
              <span className="eyebrow gold">{stages[stage].subtitle}</span>
              <h3>{stages[stage].title}</h3>
              <p>{stages[stage].text}</p>
            </div>
            <span className="scroll-instruction">
              <Mouse size={16} />
              {reduced
                ? "Selecciona una etapa para descubrirla"
                : "Sigue bajando. Contempla cómo se construye."}
              <ArrowDown size={15} />
            </span>
          </div>
        </div>
        <div className="architecture-track">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [artifact, setArtifact] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef(null);
  const menuButton = useRef(null);
  const returnToMenu = useRef(false);
  useReveal();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const click = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !menuButton.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", click);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", click);
    };
  }, [menuOpen]);
  function reserve() {
    returnToMenu.current = menuOpen;
    setMenuOpen(false);
    setReservationOpen(true);
  }
  function closeReservation() {
    setReservationOpen(false);
    if (returnToMenu.current)
      requestAnimationFrame(() => menuButton.current?.focus());
  }

  return (
    <>
      <a href="#inicio" className="skip-link">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="header-inner content-width">
          <a href="#inicio" className="brand" aria-label="Kemet Royal, inicio">
            <WingedSun />
            <span>
              KEMET ROYAL<small>UN LEGADO ETERNO</small>
            </span>
          </a>
          <nav aria-label="Navegación principal" className="desktop-nav">
            {navItems.map((item) => (
              <a
                className={activeSection === item.id ? "active" : ""}
                key={item.id}
                href={`#${item.id}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            className="button button-outline header-reserve"
            onClick={reserve}
          >
            Reserva tu experiencia <ArrowUpRight />
          </button>
          <button
            ref={menuButton}
            className="mobile-menu-toggle icon-button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            ref={menuRef}
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Navegación móvil"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <ArrowRight size={17} />
              </a>
            ))}
            <button className="button button-gold" onClick={reserve}>
              Reserva tu experiencia <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </header>

      <main>
        <section
          id="inicio"
          className="hero content-width"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> EL ANTIGUO EGIPTO. UN NUEVO
              DESTINO.
            </span>
            <h1 id="hero-title">
              <span className="sr-only">Kemet Royal: </span>Soberanía.
              <br />
              Sofisticación.
              <br />
              <em>Misticismo.</em>
            </h1>
            <p className="hero-description">
              Descubre la majestuosidad del Antiguo Egipto en un establecimiento
              gastronómico de alta gama y hospitalidad temática inmersiva, en el
              corazón de <strong>Managua, Nicaragua.</strong>
            </p>
            <button className="button button-gold hero-cta" onClick={reserve}>
              Reservar mi Banquete Real <ArrowUpRight />
            </button>
            <a className="text-link hero-discover" href="#concepto">
              <span className="small-circle">
                <ArrowDown size={14} />
              </span>{" "}
              Un viaje más allá de la mesa
            </a>
          </div>
          <div className="hero-visual">
            <div className="hero-sun-disc" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <Star className="hero-star" />
            <div className="hero-visual-label">
              <span className="live-dot" /> UNA VISIÓN MONUMENTAL
            </div>
            <Scene
              model="temple"
              className="hero-model"
              label="Modelo 3D interactivo de la fachada monumental de Kemet Royal"
            />
            <div className="hero-annotation">
              <span className="annotation-cross">+</span>
              <div>
                PIRAMIDIÓN DORADO
                <small>Donde la tierra se encuentra con el cielo.</small>
              </div>
            </div>
            <div className="hero-model-caption">
              <span>01 — EL TEMPLO</span>
              <span>MODELO 3D INTERACTIVO</span>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              <MapPin size={14} /> MANAGUA, NICARAGUA
            </span>
            <span className="hero-anchor">
              Explora nuestra fachada, del pórtico hipóstilo al piramidión
              dorado.
            </span>
            <a href="#concepto" aria-label="Descubrir el concepto">
              <ArrowDown size={18} />
            </a>
          </div>
        </section>

        <div className="values-strip">
          <div className="content-width">
            <span>
              <Columns3 size={18} /> Arquitectura monumental
            </span>
            <Star />
            <span>
              <Utensils size={17} /> Gastronomía de autor
            </span>
            <Star />
            <span>
              <Eye size={19} /> Una experiencia inmersiva
            </span>
            <Star />
            <span>
              <Lotus /> Hospitalidad extraordinaria
            </span>
          </div>
        </div>

        <section
          id="concepto"
          className="concept-section section-space content-width"
          aria-labelledby="concept-title"
        >
          <div className="concept-art" data-reveal>
            <div className="artifact-arch">
              <div className="artifact-arch-inner" />
              <span className="artifact-vertical-label">
                EL ARTE DE LO ETERNO
              </span>
              <Scene
                model={artifacts[artifact].model}
                className="artifact-viewer"
                label={`Modelo interactivo: ${artifacts[artifact].name}`}
              />
              <span className="artifact-number">
                {artifacts[artifact].numeral}
              </span>
              <div className="artifact-caption">
                <span>COLECCIÓN KEMET ROYAL</span>
                <p>{artifacts[artifact].caption}</p>
              </div>
            </div>
            <div
              className="artifact-tabs"
              role="tablist"
              onKeyDown={tabKeys}
              aria-label="Explorar la colección 3D"
            >
              {artifacts.map((item, index) => (
                <button
                  key={item.model}
                  role="tab"
                  tabIndex={artifact === index ? 0 : -1}
                  aria-selected={artifact === index}
                  aria-controls="collection-description"
                  onClick={() => setArtifact(index)}
                >
                  <span>{item.numeral}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="concept-copy" data-reveal>
            <span className="eyebrow">
              <span className="tiny-line" /> 01 / EL CONCEPTO
            </span>
            <h2 id="concept-title">
              Más que un lugar.
              <br />
              Un viaje en el <em>tiempo.</em>
            </h2>
            <p className="section-intro">
              Un destino turístico sin igual, donde la historia cobra vida y
              cada visita se convierte en un recuerdo.
            </p>
            <p>
              Kemet Royal representa una propuesta pionera en la gastronomía de
              Nicaragua. Un espacio concebido para quienes buscan vivencias
              personalizadas y memorables, donde la sofisticación se encuentra
              con el alma del Antiguo Egipto.
            </p>
            <p id="collection-description">
              Más allá de un restaurante, somos un destino cultural. Nuestra
              museografía especializada reúne vitrinas climatizadas con réplicas
              artísticas certificadas a escala real, desde el busto de Nefertiti
              hasta estelas jeroglíficas votivas.
            </p>
            <div className="concept-note">
              <Lotus />
              <span>
                La historia se contempla.
                <br />
                <em>La experiencia se vive.</em>
              </span>
            </div>
            <a href="#arquitectura" className="text-link underlined">
              Adéntrate en nuestro reino <ArrowRight size={17} />
            </a>
          </div>
        </section>

        <Architecture />

        <section
          id="gastronomia"
          className="gastronomy-section section-space content-width"
          aria-labelledby="gastronomy-title"
        >
          <div className="gastronomy-top" data-reveal>
            <div>
              <span className="eyebrow">
                <span className="tiny-line" /> 03 / GASTRONOMÍA FARAÓNICA
              </span>
              <h2 id="gastronomy-title">
                Un legado que
                <br />
                se <em>saborea.</em>
              </h2>
            </div>
            <p>
              Inspirada en los rituales del Imperio Nuevo.
              <br />
              Reinterpretada con el alma de Nicaragua.
              <br />
              <span>Gastronomía de autor para una mesa extraordinaria.</span>
            </p>
          </div>
          <div className="gastronomy-grid">
            <div className="food-image-wrap" data-reveal>
              <img
                src="/images/royal-banquet.webp"
                width="1536"
                height="1024"
                loading="lazy"
                alt="Propuesta de pato laqueado con miel, dátiles e higos sobre cerámica artesanal"
              />
              <div className="food-image-overlay">
                <span>EL BANQUETE REAL</span>
                <h3>Una ofrenda a tus sentidos.</h3>
              </div>
              <span className="food-image-credit">
                IMAGEN GASTRONÓMICA ILUSTRATIVA
              </span>
            </div>
            <div className="menu-preview" data-reveal>
              <span className="eyebrow">DEL PAPIRO A TU MESA</span>
              <p className="menu-intro">
                Una profunda investigación de los hábitos alimenticios egipcios
                se encuentra con ingredientes frescos de la producción agrícola
                y ganadera nicaragüense.
              </p>
              <div className="dish">
                <span className="dish-number">I</span>
                <div>
                  <h3>Cordero de los dioses</h3>
                  <p>
                    Cordero braseado lentamente, tradición ancestral y carácter
                    contemporáneo.
                  </p>
                </div>
                <Star />
              </div>
              <div className="dish">
                <span className="dish-number">II</span>
                <div>
                  <h3>La ofrenda del Nilo</h3>
                  <p>
                    Pato laqueado con miel silvestre, un delicado equilibrio
                    entre dulzura y profundidad.
                  </p>
                </div>
                <Star />
              </div>
              <div className="dish">
                <span className="dish-number">III</span>
                <div>
                  <h3>El pan de la eternidad</h3>
                  <p>
                    Panes rústicos de trigo ancestral y cerveza artesanal con
                    notas de miel y dátiles.
                  </p>
                </div>
                <Star />
              </div>
              <button className="text-link underlined" onClick={reserve}>
                Tu lugar en el banquete <ArrowRight size={17} />
              </button>
            </div>
          </div>
          <div className="gastronomy-footnote">
            <span>
              <Check size={14} /> Ingredientes de origen nicaragüense
            </span>
            <span>
              <Check size={14} /> Inspiración histórica, creación contemporánea
            </span>
            <span>
              <Check size={14} /> Cada plato cuenta una historia
            </span>
          </div>
        </section>

        <section
          id="experiencia"
          className="experience-section section-space"
          aria-labelledby="experience-title"
        >
          <div className="content-width">
            <div className="section-heading" data-reveal>
              <span className="eyebrow">
                <span className="tiny-line" /> 04 / EL RITUAL DE SERVICIO
              </span>
              <h2 id="experience-title">
                No vienes a cenar.
                <br />
                Vienes a ser <em>agasajado.</em>
              </h2>
              <p>
                Te recibimos como a un Dignatario de una Nación Aliada.
                <br />
                Una celebración de Estado. Una experiencia de cinco sentidos.
              </p>
            </div>
            <div className="rituals-grid">
              {rituals.map((ritual, index) => (
                <article
                  className="ritual"
                  key={ritual.title}
                  data-reveal
                  style={{ "--reveal-delay": `${index * 90}ms` }}
                >
                  <div className="ritual-top">
                    <span>0{index + 1}</span>
                    <ritual.icon className="ritual-icon" size={35} />
                    <span className="ritual-line" />
                  </div>
                  <span className="eyebrow">{ritual.eyebrow}</span>
                  <h3>{ritual.title}</h3>
                  <p>{ritual.text}</p>
                  <span className="ritual-detail">{ritual.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-invitation">
          <div className="invitation-orbit" />
          <WingedSun />
          <span className="eyebrow gold">
            ALGUNAS NOCHES SE RECUERDAN PARA SIEMPRE
          </span>
          <h2>
            La próxima puede ser <em>la tuya.</em>
          </h2>
          <p>El reino está listo para recibirte.</p>
          <button className="button button-gold" onClick={reserve}>
            Reservar mi Banquete Real <ArrowUpRight />
          </button>
          <span className="invitation-location">
            <MapPin size={13} /> Managua, Nicaragua
          </span>
        </section>
      </main>

      <footer className="site-footer content-width">
        <a
          href="#inicio"
          className="brand footer-brand"
          aria-label="Kemet Royal, volver al inicio"
        >
          <WingedSun />
          <span>
            KEMET ROYAL<small>SOBERANÍA · SOFISTICACIÓN · MISTICISMO</small>
          </span>
        </a>
        <span className="footer-copyright">
          © {new Date().getFullYear()} Kemet Royal.
          <br />
          Un legado eterno. Una experiencia tuya.
        </span>
        <a href="#inicio" className="back-top">
          Volver al inicio <ArrowUpRight />
        </a>
      </footer>
      <ReservationModal open={reservationOpen} onClose={closeReservation} />
    </>
  );
}

function ArrowUpRight() {
  return <ArrowRight size={16} className="arrow-diagonal" aria-hidden="true" />;
}
