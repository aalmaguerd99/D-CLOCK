import Navbar from "@/components/Navbar";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidad — D-CLOCK",
  description: "Aviso de privacidad de D-CLOCK, sistema de control de asistencia empresarial desarrollado por D99-TECH.",
};

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[3.75rem]">
        <div className="max-w-3xl mx-auto px-6 py-20">

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={36} height={36} className="object-contain" />
              <span className="font-extrabold text-[#0D0D0C]">D-CLOCK</span>
            </div>
            <h1 className="text-[2.25rem] font-extrabold tracking-[-0.03em] text-[#0D0D0C] mb-3">
              Política de Privacidad
            </h1>
            <p className="text-[#78786E] text-[14px]">Última actualización: 15 de mayo de 2025</p>
          </div>

          <div className="space-y-10 text-[#38382F] text-[14.5px] leading-[1.8]">

            <Section title="1. Responsable del tratamiento">
              <p>
                <strong>D99-TECH</strong> (en adelante "nosotros", "el desarrollador" o "D-CLOCK") es el responsable
                del diseño y distribución del software D-CLOCK. Sin embargo, el <strong>tratamiento y almacenamiento
                de los datos personales de los empleados es responsabilidad exclusiva de la empresa
                que adquiere la licencia</strong> (en adelante "la empresa usuaria"), ya que D-CLOCK opera
                completamente en el servidor propio del cliente.
              </p>
              <p className="mt-3">
                Para contactar a D99-TECH respecto al software:{" "}
                <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline font-medium">
                  contacto@d99-tech.com
                </a>
              </p>
            </Section>

            <Section title="2. Datos que el software recopila">
              <p>D-CLOCK, cuando es operado por una empresa usuaria, puede recopilar y almacenar la siguiente información de los empleados registrados:</p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "Nombre completo, apellidos",
                  "Número de empleado",
                  "Foto de perfil del empleado",
                  "PIN de acceso (almacenado de forma cifrada)",
                  "Datos laborales: departamento, área, puesto, horario asignado",
                  "Datos de contacto: correo electrónico, número de teléfono",
                  "Datos personales: RFC, CURP, NSS, fecha de nacimiento, género, domicilio",
                  "Registros de asistencia: hora de entrada y salida con fecha y timestamp exacto",
                  "Fotografía tomada al momento de registrar la asistencia (selfie de verificación)",
                  "Coordenadas GPS al momento del registro (latitud y longitud)",
                  "Geocerca asociada al registro (nombre de la sucursal o área de trabajo)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="3. Finalidad del tratamiento">
              <p>Los datos recopilados por D-CLOCK se utilizan exclusivamente para:</p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "Registrar y controlar la asistencia de los empleados de la empresa usuaria",
                  "Verificar la identidad del empleado mediante fotografía en cada registro",
                  "Validar que el empleado se encuentra dentro del área autorizada (geo-cerca)",
                  "Generar reportes de asistencia para la empresa usuaria (nómina, IMSS, etc.)",
                  "Permitir el acceso del empleado a la aplicación móvil mediante autenticación",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="4. Almacenamiento y ubicación de los datos">
              <p>
                D-CLOCK es un sistema <strong>100% on-premise</strong>. Esto significa que{" "}
                <strong>todos los datos se almacenan únicamente en el servidor propio de la empresa usuaria</strong>,
                dentro de sus instalaciones o en la infraestructura que ella misma administre.
              </p>
              <p className="mt-3">
                D99-TECH <strong>no tiene acceso</strong> a los datos personales de los empleados,
                no almacena información en servidores de terceros y no realiza transferencias de datos
                a la nube sin el consentimiento explícito de la empresa usuaria.
              </p>
              <p className="mt-3">
                Los datos se almacenan en una base de datos SQLite local, protegida por el sistema
                operativo Windows de la empresa.
              </p>
            </Section>

            <Section title="5. Aplicación móvil">
              <p>
                La aplicación móvil D-CLOCK (disponible para Android e iOS) se conecta directamente
                al servidor de la empresa usuaria a través de la red local o IP pública configurada
                por el administrador. La app:
              </p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "Solicita permiso de cámara para tomar la selfie de verificación al momento del registro",
                  "Solicita permiso de ubicación (GPS) para validar la geo-cerca al momento del registro",
                  "Almacena localmente solo los datos de sesión del empleado (nombre, número, foto de perfil) para funcionamiento offline",
                  "No comparte datos con terceros, redes publicitarias ni servicios de analítica",
                  "La URL del servidor se configura manualmente por el empleado; D99-TECH no conoce ni almacena esta información",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="6. Transferencia de datos a terceros">
              <p>
                D99-TECH <strong>no vende, cede ni transfiere</strong> datos personales a terceros.
                La empresa usuaria es responsable de definir sus propias políticas de acceso y
                compartición de la información dentro de su organización.
              </p>
              <p className="mt-3">
                El software permite exportar reportes en formatos Excel y PDF para uso interno
                de la empresa (nómina, recursos humanos, contabilidad). Estos archivos son
                responsabilidad exclusiva de la empresa usuaria.
              </p>
            </Section>

            <Section title="7. Derechos ARCO">
              <p>
                Los empleados registrados en D-CLOCK tienen los siguientes derechos respecto a sus datos personales
                (conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares):
              </p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "Acceso: solicitar qué datos personales se tienen registrados",
                  "Rectificación: solicitar la corrección de datos inexactos o incompletos",
                  "Cancelación: solicitar la eliminación de sus datos cuando proceda",
                  "Oposición: oponerse al tratamiento de sus datos para fines específicos",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                Estos derechos deben ejercerse ante <strong>la empresa usuaria</strong> que opera D-CLOCK,
                ya que es quien tiene control sobre los datos. D99-TECH puede ser contactado en{" "}
                <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline font-medium">
                  contacto@d99-tech.com
                </a>{" "}
                para dudas sobre el software en general.
              </p>
            </Section>

            <Section title="8. Seguridad de la información">
              <p>D-CLOCK implementa las siguientes medidas de seguridad:</p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "PINs de empleados almacenados con hashing bcrypt (no se guardan en texto plano)",
                  "Sesiones de administrador con tokens temporales de 24 horas",
                  "Comunicación entre app móvil y servidor mediante HTTP sobre red privada o VPN",
                  "Base de datos SQLite con modo WAL para integridad de datos",
                  "El panel de administración requiere autenticación con usuario y contraseña",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                La empresa usuaria es responsable de mantener la seguridad del servidor donde opera D-CLOCK,
                incluyendo la configuración del firewall, acceso a la red y respaldos de la base de datos.
              </p>
            </Section>

            <Section title="9. Retención de datos">
              <p>
                D-CLOCK no elimina automáticamente los datos. La empresa usuaria determina el período
                de retención de los registros de asistencia y datos de empleados, y es responsable
                de eliminarlos cuando el empleado deja de laborar o cuando así lo requiera la ley.
              </p>
              <p className="mt-3">
                El panel de administración incluye funciones para eliminar registros por rango de fechas
                o de forma completa.
              </p>
            </Section>

            <Section title="10. Licenciamiento y activación">
              <p>
                Para la activación de licencias, D-CLOCK se conecta únicamente a los servidores de
                D99-TECH para validar la clave de licencia. En este proceso se transmite:
              </p>
              <ul className="mt-4 space-y-2 pl-4">
                {[
                  "La clave de licencia adquirida",
                  "Un identificador único del equipo (machine ID) para prevenir activaciones múltiples",
                  "La dirección IP pública del equipo (para registro en el log de auditoría)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                No se transmiten datos de empleados ni información de asistencia durante este proceso.
              </p>
            </Section>

            <Section title="11. Cambios a esta política">
              <p>
                D99-TECH puede actualizar esta política de privacidad en cualquier momento. Las versiones
                actualizadas se publicarán en{" "}
                <a href="https://d-clock-production.up.railway.app/privacidad"
                  className="text-[#2563EB] hover:underline font-medium">
                  d-clock-production.up.railway.app/privacidad
                </a>
                {" "}con la fecha de última actualización.
              </p>
            </Section>

            <Section title="12. Contacto">
              <p>Para preguntas, comentarios o solicitudes relacionadas con esta política:</p>
              <div className="mt-4 glass rounded-2xl p-6 space-y-2 text-[13.5px]">
                <p><strong>D99-TECH</strong></p>
                <p>Correo: <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline">contacto@d99-tech.com</a></p>
                <p>Sitio web: <a href="https://d-clock-production.up.railway.app" className="text-[#2563EB] hover:underline">d-clock-production.up.railway.app</a></p>
              </div>
            </Section>

          </div>
        </div>

        <footer className="border-t border-[rgba(200,192,178,.2)] py-10 px-6 mt-10">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={22} height={22} className="object-contain"/>
              <span className="font-extrabold text-[13px] text-[#0D0D0C]">D-CLOCK</span>
              <span className="text-[#D0CBC0]">·</span>
              <span className="text-[11.5px] text-[#AEAEA4]">by D99-TECH</span>
            </div>
            <p className="text-[11.5px] text-[#AEAEA4]">© {new Date().getFullYear()} D99-TECH. Todos los derechos reservados.</p>
            <a href="/" className="text-[11.5px] text-[#2563EB] hover:underline">← Volver al inicio</a>
          </div>
        </footer>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[1.1rem] font-bold text-[#0D0D0C] mb-3 pb-2 border-b border-[rgba(200,192,178,.3)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
