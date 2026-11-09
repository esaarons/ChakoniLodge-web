import Image from "next/image";
import { copy, site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "@/components/ui/CurrentYear";

export function Footer() {
  return (
    <footer className="bg-forest pb-10 pt-16 text-ivory sm:pb-12 sm:pt-20 lg:pt-28">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-14">
          <div className="col-span-2 lg:col-span-5">
            <Image
              src={site.logo.src}
              alt={site.name}
              width={site.logo.width}
              height={site.logo.height}
              sizes="240px"
              className="h-auto w-[clamp(11.25rem,48vw,15rem)] object-contain"
            />
            <p className="mt-4 max-w-sm text-ivory/75">{copy.footer.tagline}</p>
          </div>

          <nav aria-label="Pie de página" className="col-span-2 sm:col-span-1 lg:col-span-3">
            <p className="text-sm font-semibold text-ivory">Explorar</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-ivory/85 transition-colors hover:text-ivory">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 sm:col-span-1 lg:col-span-4">
            <p className="text-sm font-semibold text-ivory">Legal</p>
            <ul className="mt-5 space-y-3 text-sm text-ivory/75">
              {site.legal.map((item) => (
                <li key={item.label}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 lg:mt-20 bg-forest-deep/60 -mx-5 px-5 py-6 text-sm text-ivory/75 sm:-mx-8 sm:flex-row sm:justify-between sm:px-8 lg:mx-0 lg:px-6">
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p>{copy.footer.prototypeNote}</p>
        </div>
      </Container>
    </footer>
  );
}
