import { galleryOrder } from "@/config/photos";
import { site } from "@/config/site";
import { getPhotos } from "@/lib/photos";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { BookingBox } from "@/components/sections/BookingBox";
import { Experiences } from "@/components/sections/Experiences";
import { GallerySection } from "@/components/sections/gallery/GallerySection";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Location } from "@/components/sections/Location";
import { Rooms } from "@/components/sections/Rooms";

export default function Home() {
  const photos = getPhotos();
  const heroSrc = photos.exterior.src;

  // Datos estructurados mínimos: solo información verificada.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: site.name,
    description: site.description,
    url: site.url,
    ...(heroSrc && { image: new URL(heroSrc, site.url).toString() }),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: "PE",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.location.coordinates.lat, longitude: site.location.coordinates.lng },
    hasMap: site.location.mapsUrl,
  };

  return (
    <>
      <Header />
      <main id="contenido">
        <Hero photo={photos.exterior} />
        <BookingBox />
        <Intro photos={{ left: photos.dusk, center: photos.terrace, right: photos["pool-lounge"] }} />
        <Rooms
          photos={[photos["room-bed"], photos["room-main"], photos["room-light"], photos["room-wide"], photos["room-detail"]]}
        />
        <Experiences photos={[photos.garden, photos["pool-garden"], photos.terrace]} />
        <GallerySection photos={galleryOrder.map((id) => photos[id])} />
        <Location />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
