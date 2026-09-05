import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  Sparkles,
  X,
} from "lucide-react";
import "./ReservationModal.css";

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const escapeCalendar = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
const calendarTimestamp = (date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const foldCalendarLine = (line) => {
  const encoder = new TextEncoder();
  let folded = "";
  let length = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (length + bytes > 75) {
      folded += "\r\n ";
      length = 1;
    }
    folded += character;
    length += bytes;
  }
  return folded;
};

function downloadReminder(details) {
  const startsAt = new Date(`${details.date}T${details.time}:00-06:00`);
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
  const description = [
    "Recordatorio personal: contactar a Kemet Royal para consultar disponibilidad.",
    "Este recordatorio no es una reserva. No se ha enviado ninguna solicitud.",
    `Nombre: ${details.name}`,
    `Comensales: ${details.guests}`,
    details.occasion ? `Ocasión: ${details.occasion}` : "",
    "La hora seleccionada corresponde a Managua, Nicaragua.",
  ]
    .filter(Boolean)
    .join("\n");
  const contents = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kemet Royal//Recordatorio personal//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${globalThis.crypto?.randomUUID?.() || Date.now()}@kemetroyal.local`,
    `DTSTAMP:${calendarTimestamp(new Date())}`,
    `DTSTART:${calendarTimestamp(startsAt)}`,
    `DTEND:${calendarTimestamp(endsAt)}`,
    `SUMMARY:${escapeCalendar("Contactar a Kemet Royal: consultar disponibilidad")}`,
    `DESCRIPTION:${escapeCalendar(description)}`,
    `LOCATION:${escapeCalendar("Managua, Nicaragua")}`,
    "STATUS:TENTATIVE",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendarLine)
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "kemet-royal-recordatorio.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReservationModal({ open, onClose }) {
  const id = useId();
  const dialogRef = useRef(null);
  const summaryRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [details, setDetails] = useState({
    name: "",
    email: "",
    date: "",
    time: "19:00",
    guests: "2",
    occasion: "",
  });
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setSubmitted(null);
    setError("");
    setDownloaded(false);
    const frame = window.requestAnimationFrame(() =>
      dialogRef.current?.focus(),
    );
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) {
        event.preventDefault();
        dialogRef.current?.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          !focusable.includes(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKey);
      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused.isConnected
      )
        previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (submitted && open) {
      if (dialogRef.current) dialogRef.current.scrollTop = 0;
      summaryRef.current?.focus({ preventScroll: true });
    }
  }, [submitted, open]);

  if (!open) return null;

  const update = (event) => {
    const { name, value } = event.target;
    setDetails((previous) => ({ ...previous, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!details.name.trim()) {
      setError("Escribe tu nombre para personalizar tu visita.");
      event.currentTarget.elements.name.focus();
      return;
    }
    if (details.date < localToday()) {
      setError("Selecciona hoy o una fecha futura.");
      event.currentTarget.elements.date.focus();
      return;
    }
    setError("");
    setSubmitted({
      ...details,
      name: details.name.trim(),
      occasion: details.occasion.trim(),
    });
  };

  const formattedDate = submitted
    ? new Intl.DateTimeFormat("es-NI", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${submitted.date}T12:00:00`))
    : "";

  return (
    <div
      className="kr-reservation-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="kr-reservation"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          className="kr-reservation-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar reserva"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
        <div className="kr-reservation-topline" aria-hidden="true">
          <span />
          <Sparkles size={20} strokeWidth={1.25} />
          <span />
        </div>
        <p className="kr-reservation-eyebrow">UNA VELADA EXTRAORDINARIA</p>
        <h2 id={`${id}-title`} ref={summaryRef} tabIndex={-1}>
          {submitted ? (
            "Tu banquete, un paso más cerca"
          ) : (
            <>
              Tu lugar en
              <br />
              <em>la mesa real.</em>
            </>
          )}
        </h2>

        {submitted ? (
          <div className="kr-reservation-success">
            <p id={`${id}-description`} className="kr-reservation-intro">
              {submitted.name}, estos son los detalles de la visita que tienes
              en mente.
            </p>
            <dl className="kr-reservation-summary">
              <div>
                <dt>Fecha</dt>
                <dd>{formattedDate}</dd>
              </div>
              <div>
                <dt>Hora de Managua</dt>
                <dd>{submitted.time}</dd>
              </div>
              <div>
                <dt>Comensales</dt>
                <dd>
                  {submitted.guests}{" "}
                  {submitted.guests === "1" ? "persona" : "personas"}
                </dd>
              </div>
              {submitted.occasion && (
                <div>
                  <dt>Ocasión</dt>
                  <dd>{submitted.occasion}</dd>
                </div>
              )}
            </dl>
            <div className="kr-reservation-notice">
              <CalendarDays size={19} strokeWidth={1.5} />
              <p>
                <strong>Tu reserva aún no está confirmada.</strong> Este
                formulario prepara tu visita; no envía una solicitud al
                restaurante. Contacta a Kemet Royal para consultar
                disponibilidad y confirmar.
              </p>
            </div>
            <button
              className="kr-reservation-submit"
              type="button"
              onClick={() => {
                downloadReminder(submitted);
                setDownloaded(true);
              }}
            >
              {downloaded ? <Check size={17} /> : <Download size={17} />}
              {downloaded
                ? "Descargar de nuevo"
                : "Guardar recordatorio en mi calendario"}
            </button>
            <p className="kr-reservation-calendar-note" aria-live="polite">
              {downloaded
                ? "Se ha preparado tu archivo .ics. Ábrelo en tu calendario para guardar el recordatorio."
                : "Un recordatorio personal para contactar al restaurante."}
            </p>
            <button
              className="kr-reservation-back"
              type="button"
              onClick={() => {
                setSubmitted(null);
                setDownloaded(false);
                if (dialogRef.current) dialogRef.current.scrollTop = 0;
                dialogRef.current?.focus({ preventScroll: true });
              }}
            >
              Editar los detalles
            </button>
            <button
              className="kr-reservation-done"
              type="button"
              onClick={onClose}
            >
              Volver a explorar Kemet Royal <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p id={`${id}-description`} className="kr-reservation-intro">
              Imagina tu próxima celebración. Prepara los detalles de tu visita
              y guarda un recordatorio personal.
            </p>
            <form className="kr-reservation-form" onSubmit={handleSubmit}>
              <div className="kr-reservation-field">
                <label htmlFor={`${id}-name`}>
                  Tu nombre <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  autoComplete="name"
                  placeholder="Nombre y apellido"
                  value={details.name}
                  onChange={update}
                  maxLength={100}
                  required
                />
              </div>
              <div className="kr-reservation-field">
                <label htmlFor={`${id}-email`}>
                  Correo electrónico <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={details.email}
                  onChange={update}
                  maxLength={254}
                  required
                />
              </div>
              <div className="kr-reservation-fields-row">
                <div className="kr-reservation-field">
                  <label htmlFor={`${id}-date`}>
                    Fecha deseada <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${id}-date`}
                    type="date"
                    name="date"
                    min={localToday()}
                    value={details.date}
                    onChange={update}
                    required
                  />
                </div>
                <div className="kr-reservation-field">
                  <label htmlFor={`${id}-time`}>
                    Hora <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${id}-time`}
                    type="time"
                    name="time"
                    value={details.time}
                    onChange={update}
                    required
                  />
                </div>
              </div>
              <div className="kr-reservation-fields-row">
                <div className="kr-reservation-field">
                  <label htmlFor={`${id}-guests`}>
                    Comensales <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${id}-guests`}
                    name="guests"
                    value={details.guests}
                    onChange={update}
                    required
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "persona" : "personas"}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="kr-reservation-field">
                  <label htmlFor={`${id}-occasion`}>
                    Ocasión <span>(opcional)</span>
                  </label>
                  <input
                    id={`${id}-occasion`}
                    name="occasion"
                    placeholder="Una noche especial"
                    value={details.occasion}
                    onChange={update}
                    maxLength={100}
                  />
                </div>
              </div>
              {error && (
                <p className="kr-reservation-error" role="alert">
                  {error}
                </p>
              )}
              <p className="kr-reservation-form-note">
                Hora local de Managua. Los campos con * son obligatorios. Tus
                datos permanecen en esta página y no se envían al restaurante.
              </p>
              <button className="kr-reservation-submit" type="submit">
                Preparar mi banquete <ArrowRight size={17} strokeWidth={1.5} />
              </button>
              <p className="kr-reservation-calendar-note">
                Sujeto a disponibilidad y confirmación del establecimiento.
              </p>
            </form>
          </>
        )}
        <div className="kr-reservation-bottomline" aria-hidden="true">
          ◆
        </div>
      </section>
    </div>
  );
}
