// Hand-curated copy for the corporate pages. Wording is the original temco.ro
// text, typeset with Romanian diacritics. Product & article bodies come from data/.

export const SITE = {
  name: 'TEMCO',
  legalName: 'Tehno Electro Medical Company',
  url: 'https://www.temco.ro',
  locale: 'ro_RO',
  email: 'office@temco.ro',
  phone: { label: '021 252 46 50', href: 'tel:+40212524650' },
  description:
    'TEMCO — Tehno Electro Medical Company. Din 1990, aparatură medicală de referință pentru toată România: endoscopie, chirurgie laparoscopică, imagistică, microscopie, laborator, stomatologie, simulatoare medicale.',
  // When set (e.g. a Formspree / Netlify / own API URL) forms POST there.
  // When empty, forms fall back to opening a pre-filled e-mail to office@temco.ro.
  formEndpoint: '',
};

export const NAV = [
  { label: 'Acasă', href: '/' },
  { label: 'Despre noi', href: '/despre-noi/' },
  { label: 'Produse', href: '/produsele-noastre/', mega: true },
  { label: 'Instruire / Evenimente', href: '/instruire-evenimente/' },
  { label: 'Contact', href: '/contact/' },
];

export const FOOTER_LINKS = [
  { label: 'Acasă', href: '/' },
  { label: 'Despre noi', href: '/despre-noi/' },
  { label: 'Produse', href: '/produsele-noastre/' },
  { label: 'Instruire / Evenimente', href: '/instruire-evenimente/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Politică de confidențialitate', href: '/politica-de-confidentialitate/' },
  { label: 'Politica cookies', href: '/politica-cookies/' },
];

export const HOME = {
  slides: [
    'https://www.temco.ro/wp-content/uploads/2019/12/home-banner-01.jpg',
    'https://www.temco.ro/wp-content/uploads/2019/12/home-banner-02.jpg',
  ],
  values: [
    { icon: 'crown', title: 'Când vorbim despre sănătate', text: 'TEMCO pune întotdeauna oamenii pe primul loc.' },
    { icon: 'star', title: 'Doar împreună', text: 'putem oferi servicii de calitate.' },
    { icon: 'heart', title: 'Mulțumim pentru încrederea', text: 'acordată produselor și serviciilor noastre.' },
  ],
};

export const ABOUT = {
  lead:
    'Compania <strong>Tehno Electro Medical Company</strong>, cunoscută sub numele de <strong>TEMCO</strong>, se naște și crește din anul 1990 de la trei membri, la peste 80 de membri în prezent, având o prezență activă în toată țara și fiind promotorul unor tehnici și aparatură medicală de referință pentru toată România.',
  milestones: [
    {
      year: '1990', kicker: 'Începuturile', title: 'Se naște TEMCO',
      text: 'Compania pornește la drum cu trei membri. Astăzi, echipa numără peste 80 de oameni, cu o prezență activă în toată țara.',
    },
    {
      year: '1992', kicker: 'Premieră în România', title: 'Prima trusă funcțională de laparoscopie abdominală',
      text: 'TEMCO introduce în România prima trusă funcțională de laparoscopie abdominală, școlarizând și primii chirurgi în această tehnică, fapt ce contribuie la dezvoltarea acestei tehnici. Acest lucru se petrecea la Cluj-Napoca, la Clinica Chirurgie nr. 3, în anul 1992, iar echipamentul era livrat de TEMCO și produs de liderul mondial în endoscopie, OLYMPUS.',
    },
    {
      year: '1996', kicker: 'Premieră în România', title: 'Primul Eco-Endoscop din România',
      text: 'TEMCO nu se oprește aici cu promovarea noutăților și a premierelor în tehnica medicală; în anul 1996 livrează primul Eco-Endoscop în România, o tehnologie de ultimă oră a companiei OLYMPUS, tehnica fiind astăzi una complexă, dar existentă în multe clinici de profil din România.',
    },
    {
      year: 'FibroScan', kicker: 'Diagnostic neinvaziv', title: 'FIBROSCAN — o premieră mondială',
      text: 'Trebuie amintit și FIBROSCAN, primul aparat din lume care folosește o metodă neinvazivă de depistare a fibrozelor hepatice, echipament produs de firma franceză ECHOSENS, aparat promovat, montat și întreținut în țară.',
    },
    {
      year: 'Mentor', kicker: 'Formare medicală', title: 'Simulatoarele digitale MENTOR',
      text: 'TEMCO nu neglijează nici cursanții noilor tehnici și livrează în România familia de simulatoare digitale MENTOR, produse de firma SIMBIONIX din Israel, destinate învățării virtuale a tehnicilor de laparoscopie și endoscopie digestivă, endo-urologie și angiografie.',
    },
  ],
  isoIntro: 'Mai jos regăsiți Certificatele ISO ale TEMCO',
  iso: [
    { code: 'ISO 9001:2015', name: 'Sistem de management al calității' },
    { code: 'ISO 13485:2016', name: 'Dispozitive medicale — management al calității' },
    { code: 'ISO 14001:2015', name: 'Sistem de management de mediu' },
  ],
};

const tel = (s) => 'tel:+40' + s.replace(/\D/g, '').replace(/^0/, '');
export const CONTACT = {
  hq: {
    title: 'Sediu social',
    city: 'București',
    lines: ['Str. Călușei nr. 69A, sector 2', 'București'],
    phones: ['021/252 46 50', '021/252 46 67'],
    email: 'office@temco.ro',
    map: 'Str. Călușei 69A, București',
  },
  branches: [
    { city: 'Cluj-Napoca', lines: ['Str. Republicii nr. 65 – 67', 'Cluj-Napoca, jud. Cluj'], phones: ['0264/599 331', '0264/596 270'] },
    { city: 'Cluj-Napoca', lines: ['P-ța 1 Mai nr. 4 – 5', 'Cluj-Napoca, jud. Cluj'], phones: ['0264/599 431', '0264/599 432'] },
    { city: 'Cluj-Napoca', lines: ['Str. Samuil Micu nr. 1A', 'Cluj-Napoca, jud. Cluj'], phones: ['0264/591 222'] },
    { city: 'Alexandria', lines: ['Str. Dunării nr. 220, bl. 1603, sc. D, ap. 50', 'Alexandria, jud. Teleorman'], phones: ['0247/316 028'] },
    { city: 'Iași', lines: ['Șos. Păcurari nr. 5, bl. 540, ap. 3', 'Iași, jud. Iași'], phones: ['0232/213 107'] },
    { city: 'Constanța', lines: ['Str. Mircea cel Bătrân nr. 141, parter, bl. MS1, sc. B, ap. 21', 'Constanța, jud. Constanța'], phones: ['0241/521 191'] },
    { city: 'București', lines: ['Șos. Dudești-Pantelimon nr. 42, sector 3', 'București'], phones: [] },
  ],
  tel,
};

export const FOOTER_OFFICES = [
  { title: 'TEMCO București', lines: ['Str. Călușei nr. 69A, sector 2,', 'București'], phones: ['021/252 46 50', '021/252 46 67'], email: 'office@temco.ro' },
  { title: 'TEMCO Cluj-Napoca', lines: ['Str. Republicii nr. 65 – 67,', 'Cluj-Napoca, jud. Cluj'], phones: ['0264/599 331', '0264/596 270'] },
];

export const COOKIE = {
  title: 'Apreciem confidențialitatea dumneavoastră',
  text: 'Folosim cookie-uri pentru a vă îmbunătăți experiența de navigare, pentru a vă oferi reclame sau conținut personalizat și pentru a ne analiza traficul. Făcând clic pe „Acceptă toate”, sunteți de acord cu utilizarea cookie-urilor.',
  reject: 'Respinge toate',
  accept: 'Acceptă toate',
};
