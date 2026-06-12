export interface GenerationData {
  id: string;
  name: string;
  years: string;
  tagline: string;
  description: string;
  image: string;
  heroImage: string;
  gallery: string[];
  totalProduced: string;
  engineCount: number;
  horsepowerRange: string;
  zeroToSixty: string;
  topSpeed: string;
  timeline: {
    year: string;
    title: string;
    description: string;
  }[];
  notableModels: {
    name: string;
    year: string;
    highlight: string;
  }[];
}

export const generations: GenerationData[] = [
  {
    id: "c1",
    name: "C1 Corvette",
    years: "1953-1962",
    tagline: "The birth of an American legend",
    description: "The Chevrolet Corvette was born in 1953 as America's answer to European sports cars. Designed by Harley Earl, the first Corvettes featured a fiberglass body—a revolutionary choice that would become a Corvette trademark.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "69,015",
    engineCount: 4,
    horsepowerRange: "150-360 hp",
    zeroToSixty: "5.7-8.0 seconds",
    topSpeed: "130+ mph",
    timeline: [
      { year: "1953", title: "The Beginning", description: "Only 300 Polo White Corvettes were hand-built in Flint, Michigan. All featured a 150hp Blue Flame six-cylinder engine paired with a two-speed Powerglide automatic transmission." },
      { year: "1955", title: "V8 Power Arrives", description: "The legendary small-block V8 arrived, producing 195 horsepower. This engine would transform the Corvette from a stylish cruiser into a genuine performance car." },
      { year: "1956", title: "A New Look", description: "A complete redesign brought sculpted sides, roll-up windows, and exterior door handles. The new design was both more practical and more beautiful." },
      { year: "1957", title: "Fuel Injection", description: "Rochester mechanical fuel injection was offered, producing 283 horsepower from 283 cubic inches—the famous 'one horsepower per cubic inch' milestone." },
      { year: "1961", title: "Quad Taillights", description: "The iconic quad taillights appeared, a design element that would become synonymous with Corvette identity for generations to come." },
    ],
    notableModels: [
      { name: "1957 Fuel Injection", year: "1957", highlight: "First production fuel-injected American sports car" },
      { name: "1962 327/360", year: "1962", highlight: "Most powerful C1 ever produced" },
    ],
  },
  {
    id: "c2",
    name: "C2 Sting Ray",
    years: "1963-1967",
    tagline: "The most beautiful Corvette ever made",
    description: "The C2 Sting Ray is often considered the most beautiful American car ever made. Designed by Larry Shinoda under Bill Mitchell's direction, it featured dramatic styling inspired by the 1959 Sting Ray racer.",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "117,964",
    engineCount: 6,
    horsepowerRange: "250-435 hp",
    zeroToSixty: "4.8-6.5 seconds",
    topSpeed: "145+ mph",
    timeline: [
      { year: "1963", title: "Split Window Coupe", description: "The first year featured the iconic split rear window coupe, now one of the most collectible Corvettes ever. Only 10,594 were built." },
      { year: "1964", title: "Refinement", description: "The split window was replaced with a single pane for better visibility. Functional improvements enhanced the driving experience." },
      { year: "1965", title: "Big Block Power", description: "The 396 cubic inch big block arrived with 425 horsepower, and four-wheel disc brakes became standard equipment." },
      { year: "1966", title: "427 Power", description: "The legendary 427 cubic inch engine debuted, available with up to 425 horsepower in L72 form." },
      { year: "1967", title: "L88 Legend", description: "The ultra-rare L88 option was introduced—officially rated at 430hp but actually producing over 500hp. Only 20 were built." },
    ],
    notableModels: [
      { name: "1963 Split Window", year: "1963", highlight: "Most collectible Corvette of all time" },
      { name: "1967 L88", year: "1967", highlight: "Ultra-rare racing homologation special" },
    ],
  },
  {
    id: "c3",
    name: "C3 Stingray",
    years: "1968-1982",
    tagline: "The Mako Shark comes to life",
    description: "The C3 brought the dramatic Mako Shark II concept car to production. This generation spanned 15 model years—the longest production run of any Corvette—and weathered the emissions crisis of the 1970s.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "542,861",
    engineCount: 12,
    horsepowerRange: "165-460 hp",
    zeroToSixty: "5.0-9.0 seconds",
    topSpeed: "125-150 mph",
    timeline: [
      { year: "1968", title: "Mako Shark Arrives", description: "The dramatic new body style debuted, featuring removable T-tops on the coupe and a restyled convertible." },
      { year: "1969", title: "ZL1 Aluminum", description: "The all-aluminum ZL1 427 engine was offered—only 2 were built. Each cost more than the car itself." },
      { year: "1970", title: "LT-1 Small Block", description: "The LT-1 350 produced 370 horsepower with solid lifters, becoming one of the most revered small block Corvettes." },
      { year: "1975", title: "Catalytic Converters", description: "New emissions requirements brought catalytic converters and reduced power, marking the end of the muscle car era." },
      { year: "1978", title: "25th Anniversary", description: "A special Silver Anniversary edition and the Indianapolis 500 Pace Car edition celebrated the milestone." },
    ],
    notableModels: [
      { name: "1969 ZL1", year: "1969", highlight: "All-aluminum 427, only 2 built" },
      { name: "1970 LT-1", year: "1970", highlight: "Ultimate small block performance" },
    ],
  },
  {
    id: "c4",
    name: "C4 Corvette",
    years: "1984-1996",
    tagline: "High-tech American muscle",
    description: "The C4 represented a complete reimagining of the Corvette with advanced technology, improved handling, and a digital dashboard. It became a genuine world-class sports car.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514867644123-6385d58d3cd4?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "358,180",
    engineCount: 5,
    horsepowerRange: "205-405 hp",
    zeroToSixty: "4.5-6.5 seconds",
    topSpeed: "150-180 mph",
    timeline: [
      { year: "1984", title: "The Revolution", description: "An all-new Corvette with aluminum suspension, digital instruments, and Clamshell hood. No 1983 model was sold to the public." },
      { year: "1988", title: "35th Anniversary", description: "A limited edition white-on-white package celebrated the anniversary. The suspension was significantly improved." },
      { year: "1990", title: "ZR-1 Supercar", description: "The 'King of the Hill' ZR-1 arrived with the LT5 DOHC V8 producing 375 horsepower, later increased to 405hp." },
      { year: "1992", title: "LT1 Power", description: "The new LT1 engine brought 300 horsepower to the standard Corvette with improved fuel economy." },
      { year: "1996", title: "Grand Sport", description: "The final C4 was the Admiral Blue Grand Sport, paying homage to the 1963 racing Corvettes." },
    ],
    notableModels: [
      { name: "1990 ZR-1", year: "1990", highlight: "King of the Hill supercar" },
      { name: "1996 Grand Sport", year: "1996", highlight: "Legendary final edition C4" },
    ],
  },
  {
    id: "c5",
    name: "C5 Corvette",
    years: "1997-2004",
    tagline: "Engineering excellence refined",
    description: "The C5 was the most thoroughly engineered Corvette ever, featuring a hydroformed frame, rear transaxle, and the all-new LS1 engine. It offered supercar performance at a fraction of the price.",
    image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "248,715",
    engineCount: 3,
    horsepowerRange: "345-405 hp",
    zeroToSixty: "4.0-4.8 seconds",
    topSpeed: "175-186 mph",
    timeline: [
      { year: "1997", title: "Born Again", description: "The all-new C5 arrived with revolutionary engineering including a hydroformed frame, rear transaxle, and the new LS1 engine." },
      { year: "1998", title: "Convertible Returns", description: "The C5 convertible debuted with unprecedented structural rigidity and no body flex." },
      { year: "1999", title: "Hardtop & Z06", description: "A fixed-roof hardtop model arrived, lighter and stiffer than the coupe, previewing the Z06's potential." },
      { year: "2001", title: "Z06 Legend", description: "The Z06 returned with 385 horsepower, titanium exhaust, and track-focused suspension." },
      { year: "2004", title: "Commemorative Edition", description: "The final C5 was offered in Le Mans Blue with special badging celebrating Corvette Racing's success." },
    ],
    notableModels: [
      { name: "2001 Z06", year: "2001", highlight: "Track-focused lightweight performer" },
      { name: "2004 Commemorative", year: "2004", highlight: "Le Mans racing tribute" },
    ],
  },
  {
    id: "c6",
    name: "C6 Corvette",
    years: "2005-2013",
    tagline: "Refined aggression",
    description: "The C6 refined the C5's formula with exposed headlights, sharper styling, and increased power. The Z06 and ZR1 pushed performance to unprecedented levels.",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "215,278",
    engineCount: 4,
    horsepowerRange: "400-638 hp",
    zeroToSixty: "3.4-4.2 seconds",
    topSpeed: "186-205 mph",
    timeline: [
      { year: "2005", title: "Exposed Evolution", description: "Fixed headlights returned after 40+ years, and the LS2 engine produced 400 horsepower." },
      { year: "2006", title: "Z06 Returns", description: "The aluminum-framed Z06 arrived with the 7.0L LS7 producing 505 horsepower—the most powerful naturally aspirated GM engine ever." },
      { year: "2008", title: "LS3 Power", description: "The base engine grew to 6.2 liters (LS3) with 430 horsepower and improved fuel economy." },
      { year: "2009", title: "ZR1 Supercar", description: "The supercharged LS9 produced 638 horsepower, making the ZR1 the most powerful and fastest Corvette ever." },
      { year: "2013", title: "60th Anniversary", description: "A special Arctic White package with blue stripes celebrated six decades of Corvette history." },
    ],
    notableModels: [
      { name: "2006 Z06", year: "2006", highlight: "505hp naturally aspirated masterpiece" },
      { name: "2009 ZR1", year: "2009", highlight: "Supercharged 205mph supercar" },
    ],
  },
  {
    id: "c7",
    name: "C7 Stingray",
    years: "2014-2019",
    tagline: "Technology meets tradition",
    description: "The C7 brought dramatic new styling and advanced technology while maintaining the front-engine layout. The Z06 and ZR1 offered supercar performance at unprecedented value.",
    image: "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "189,509",
    engineCount: 3,
    horsepowerRange: "455-755 hp",
    zeroToSixty: "2.8-3.8 seconds",
    topSpeed: "185-212 mph",
    timeline: [
      { year: "2014", title: "Stingray Reborn", description: "The Stingray name returned with dramatic new styling, the LT1 engine with 455 horsepower, and a revolutionary interior." },
      { year: "2015", title: "Z06 Supercar", description: "The supercharged Z06 arrived with 650 horsepower, aerodynamic downforce, and track capability rivaling European exotics." },
      { year: "2017", title: "Grand Sport", description: "The Grand Sport combined the Z06's wide body and aerodynamics with the naturally aspirated LT1 engine." },
      { year: "2018", title: "Carbon 65 Edition", description: "A special edition celebrated 65 years with exclusive ceramic gray paint and carbon fiber components." },
      { year: "2019", title: "ZR1 Finale", description: "The 755hp supercharged ZR1 became the most powerful front-engine Corvette ever, ending an era." },
    ],
    notableModels: [
      { name: "2019 ZR1", year: "2019", highlight: "755hp final front-engine king" },
      { name: "2017 Grand Sport", year: "2017", highlight: "Perfect balance of performance" },
    ],
  },
  {
    id: "c8",
    name: "C8 Stingray",
    years: "2020-Present",
    tagline: "The mid-engine revolution",
    description: "After decades of speculation, Corvette went mid-engine. The C8 delivers exotic car performance and styling while maintaining everyday usability and Corvette value.",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&auto=format&fit=crop",
    ],
    totalProduced: "200,000+",
    engineCount: 2,
    horsepowerRange: "495-670 hp",
    zeroToSixty: "2.6-2.95 seconds",
    topSpeed: "194-218 mph",
    timeline: [
      { year: "2020", title: "Mid-Engine Revolution", description: "The first production mid-engine Corvette arrived with the LT2 producing 495 horsepower and sub-3-second 0-60 capability." },
      { year: "2022", title: "IMSA GTLM Edition", description: "A special edition honored Corvette Racing's final season in the GTLM class with a championship." },
      { year: "2023", title: "Z06 Flat-Plane", description: "The Z06 arrived with a hand-built 5.5L flat-plane crank V8 producing 670 horsepower and revving to 8,600 RPM." },
      { year: "2024", title: "E-Ray Hybrid", description: "The first electrified Corvette added an electric front axle motor for all-wheel drive and even faster acceleration." },
      { year: "2025", title: "ZR1 Reborn", description: "The twin-turbo ZR1 promises to be the most powerful Corvette ever with over 1,000 horsepower." },
    ],
    notableModels: [
      { name: "2023 Z06", year: "2023", highlight: "Flat-plane crank exotic fighter" },
      { name: "2024 E-Ray", year: "2024", highlight: "First electrified AWD Corvette" },
    ],
  },
];

export const getGenerationById = (id: string): GenerationData | undefined => {
  return generations.find(gen => gen.id.toLowerCase() === id.toLowerCase());
};