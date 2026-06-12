export interface YearlyProduction {
  year: number;
  total: number;
  coupe: number;
  convertible: number;
  manual: number;
  automatic: number;
  fuelInjected: number;
  basePrice: string;
  avgCurrentPrice: string;
}

export interface ProductionStats {
  generationId: string;
  bodyStyles: string[];
  transmissions: string[];
  engines: string[];
  notableFeatures: string[];
  yearlyProduction: YearlyProduction[];
  totalProduced: number;
  totalConvertible: number;
  totalCoupe: number;
  totalManual: number;
  totalAutomatic: number;
  specialEditionsTotal: number;
  specialEditionsLabel: string;
  rarestYear: number;
  mostPopularColor: string;
  rarestColor: string;
  avgBasePrice: string;
}

export const productionStatsData: ProductionStats[] = [
  {
    generationId: "c1",
    bodyStyles: ["Convertible", "Hardtop (removable)"],
    transmissions: ["2-speed Powerglide", "3-speed Manual", "4-speed Manual"],
    engines: ["235ci Blue Flame I6", "265ci V8", "283ci V8", "327ci V8"],
    notableFeatures: [
      "First production fiberglass body",
      "First American sports car with fuel injection",
      "Iconic two-seat roadster layout",
      "Distinctive side coves"
    ],
    yearlyProduction: [
      { year: 1953, total: 300, coupe: 0, convertible: 300, manual: 0, automatic: 300, fuelInjected: 0, basePrice: "$3,498", avgCurrentPrice: "$185,000" },
      { year: 1954, total: 3640, coupe: 0, convertible: 3640, manual: 0, automatic: 3640, fuelInjected: 0, basePrice: "$2,774", avgCurrentPrice: "$85,000" },
      { year: 1955, total: 700, coupe: 0, convertible: 700, manual: 7, automatic: 693, fuelInjected: 0, basePrice: "$2,774", avgCurrentPrice: "$95,000" },
      { year: 1956, total: 3467, coupe: 0, convertible: 3467, manual: 2057, automatic: 1410, fuelInjected: 0, basePrice: "$3,120", avgCurrentPrice: "$75,000" },
      { year: 1957, total: 6339, coupe: 0, convertible: 6339, manual: 4511, automatic: 1828, fuelInjected: 1040, basePrice: "$3,176", avgCurrentPrice: "$95,000" },
      { year: 1958, total: 9168, coupe: 0, convertible: 9168, manual: 5520, automatic: 3648, fuelInjected: 1007, basePrice: "$3,591", avgCurrentPrice: "$85,000" },
      { year: 1959, total: 9670, coupe: 0, convertible: 9670, manual: 5648, automatic: 4022, fuelInjected: 745, basePrice: "$3,875", avgCurrentPrice: "$80,000" },
      { year: 1960, total: 10261, coupe: 0, convertible: 10261, manual: 6030, automatic: 4231, fuelInjected: 759, basePrice: "$3,872", avgCurrentPrice: "$78,000" },
      { year: 1961, total: 10939, coupe: 0, convertible: 10939, manual: 6498, automatic: 4441, fuelInjected: 118, basePrice: "$3,934", avgCurrentPrice: "$82,000" },
      { year: 1962, total: 14531, coupe: 0, convertible: 14531, manual: 9426, automatic: 5105, fuelInjected: 1918, basePrice: "$4,038", avgCurrentPrice: "$85,000" }
    ],
    totalProduced: 69015,
    totalConvertible: 69015,
    totalCoupe: 0,
    totalManual: 39697,
    totalAutomatic: 29318,
    specialEditionsTotal: 5587,
    specialEditionsLabel: "Fuel Injected Total",
    rarestYear: 1953,
    mostPopularColor: "White/Polo White",
    rarestColor: "Venetian Red (1954)",
    avgBasePrice: "$3,365"
  },
  {
    generationId: "c2",
    bodyStyles: ["Coupe", "Convertible"],
    transmissions: ["3-speed Manual", "4-speed Manual", "Powerglide Automatic"],
    engines: ["327ci V8", "396ci V8", "427ci V8"],
    notableFeatures: [
      "Iconic Split Window Coupe (1963 only)",
      "First Corvette with independent rear suspension",
      "Hidden headlights",
      "Big block engine option"
    ],
    yearlyProduction: [
      { year: 1963, total: 21513, coupe: 10594, convertible: 10919, manual: 16587, automatic: 4926, fuelInjected: 2610, basePrice: "$4,037", avgCurrentPrice: "$125,000" },
      { year: 1964, total: 22229, coupe: 8304, convertible: 13925, manual: 17234, automatic: 4995, fuelInjected: 1325, basePrice: "$4,037", avgCurrentPrice: "$85,000" },
      { year: 1965, total: 23562, coupe: 8186, convertible: 15376, manual: 19135, automatic: 4427, fuelInjected: 771, basePrice: "$4,106", avgCurrentPrice: "$90,000" },
      { year: 1966, total: 27720, coupe: 9958, convertible: 17762, manual: 21136, automatic: 6584, fuelInjected: 0, basePrice: "$4,084", avgCurrentPrice: "$85,000" },
      { year: 1967, total: 22940, coupe: 8504, convertible: 14436, manual: 17604, automatic: 5336, fuelInjected: 0, basePrice: "$4,240", avgCurrentPrice: "$95,000" }
    ],
    totalProduced: 117964,
    totalConvertible: 72418,
    totalCoupe: 45546,
    totalManual: 91696,
    totalAutomatic: 26268,
    specialEditionsTotal: 20,
    specialEditionsLabel: "L88 Units Built",
    rarestYear: 1967,
    mostPopularColor: "Rally Red",
    rarestColor: "Sunfire Yellow (1963)",
    avgBasePrice: "$4,101"
  },
  {
    generationId: "c3",
    bodyStyles: ["T-Top Coupe", "Convertible"],
    transmissions: ["3-speed Manual", "4-speed Manual", "3-speed Automatic"],
    engines: ["350ci V8", "427ci V8", "454ci V8", "305ci V8"],
    notableFeatures: [
      "Mako Shark II inspired design",
      "Removable T-top roof panels",
      "Longest production run (15 years)",
      "L88 and ZL1 racing engines"
    ],
    yearlyProduction: [
      { year: 1968, total: 28566, coupe: 9936, convertible: 18630, manual: 21067, automatic: 7499, fuelInjected: 0, basePrice: "$4,320", avgCurrentPrice: "$45,000" },
      { year: 1969, total: 38762, coupe: 22129, convertible: 16633, manual: 27715, automatic: 11047, fuelInjected: 0, basePrice: "$4,420", avgCurrentPrice: "$48,000" },
      { year: 1970, total: 17316, coupe: 10668, convertible: 6648, manual: 12656, automatic: 4660, fuelInjected: 0, basePrice: "$5,192", avgCurrentPrice: "$55,000" },
      { year: 1971, total: 21801, coupe: 14680, convertible: 7121, manual: 15306, automatic: 6495, fuelInjected: 0, basePrice: "$5,496", avgCurrentPrice: "$42,000" },
      { year: 1972, total: 27004, coupe: 20496, convertible: 6508, manual: 17366, automatic: 9638, fuelInjected: 0, basePrice: "$5,533", avgCurrentPrice: "$38,000" },
      { year: 1973, total: 30464, coupe: 25521, convertible: 4943, manual: 18309, automatic: 12155, fuelInjected: 0, basePrice: "$5,561", avgCurrentPrice: "$32,000" },
      { year: 1974, total: 37502, coupe: 32028, convertible: 5474, manual: 19902, automatic: 17600, fuelInjected: 0, basePrice: "$6,001", avgCurrentPrice: "$28,000" },
      { year: 1975, total: 38465, coupe: 33836, convertible: 4629, manual: 18474, automatic: 19991, fuelInjected: 0, basePrice: "$6,810", avgCurrentPrice: "$25,000" },
      { year: 1976, total: 46558, coupe: 46558, convertible: 0, manual: 17580, automatic: 28978, fuelInjected: 0, basePrice: "$7,604", avgCurrentPrice: "$22,000" },
      { year: 1977, total: 49213, coupe: 49213, convertible: 0, manual: 15366, automatic: 33847, fuelInjected: 0, basePrice: "$8,647", avgCurrentPrice: "$22,000" },
      { year: 1978, total: 46776, coupe: 46776, convertible: 0, manual: 12739, automatic: 34037, fuelInjected: 0, basePrice: "$9,351", avgCurrentPrice: "$28,000" },
      { year: 1979, total: 53807, coupe: 53807, convertible: 0, manual: 14352, automatic: 39455, fuelInjected: 0, basePrice: "$10,220", avgCurrentPrice: "$22,000" },
      { year: 1980, total: 40614, coupe: 40614, convertible: 0, manual: 9085, automatic: 31529, fuelInjected: 0, basePrice: "$13,140", avgCurrentPrice: "$20,000" },
      { year: 1981, total: 40606, coupe: 40606, convertible: 0, manual: 7347, automatic: 33259, fuelInjected: 0, basePrice: "$16,258", avgCurrentPrice: "$22,000" },
      { year: 1982, total: 25407, coupe: 25407, convertible: 0, manual: 0, automatic: 25407, fuelInjected: 0, basePrice: "$18,290", avgCurrentPrice: "$25,000" }
    ],
    totalProduced: 542861,
    totalConvertible: 70586,
    totalCoupe: 472275,
    totalManual: 227264,
    totalAutomatic: 315597,
    specialEditionsTotal: 6502,
    specialEditionsLabel: "Pace Car Editions",
    rarestYear: 1970,
    mostPopularColor: "Classic White",
    rarestColor: "War Bonnet Yellow",
    avgBasePrice: "$8,590"
  },
  {
    generationId: "c4",
    bodyStyles: ["Coupe", "Convertible", "ZR-1"],
    transmissions: ["4-speed Manual", "6-speed Manual", "4-speed Automatic"],
    engines: ["350ci L83 V8", "350ci L98 V8", "350ci LT1 V8", "350ci LT5 DOHC V8"],
    notableFeatures: [
      "First all-new Corvette in 15 years",
      "Digital dashboard instrumentation",
      "Clamshell hood design",
      "ZR-1 King of the Hill"
    ],
    yearlyProduction: [
      { year: 1984, total: 51547, coupe: 51547, convertible: 0, manual: 7128, automatic: 44419, fuelInjected: 51547, basePrice: "$21,800", avgCurrentPrice: "$12,000" },
      { year: 1985, total: 39729, coupe: 39729, convertible: 0, manual: 5643, automatic: 34086, fuelInjected: 39729, basePrice: "$24,403", avgCurrentPrice: "$14,000" },
      { year: 1986, total: 35109, coupe: 27794, convertible: 7315, manual: 5493, automatic: 29616, fuelInjected: 35109, basePrice: "$27,027", avgCurrentPrice: "$16,000" },
      { year: 1987, total: 30632, coupe: 20007, convertible: 10625, manual: 5089, automatic: 25543, fuelInjected: 30632, basePrice: "$27,999", avgCurrentPrice: "$18,000" },
      { year: 1988, total: 22789, coupe: 15382, convertible: 7407, manual: 3701, automatic: 19088, fuelInjected: 22789, basePrice: "$29,480", avgCurrentPrice: "$18,000" },
      { year: 1989, total: 26412, coupe: 16663, convertible: 9749, manual: 4267, automatic: 22145, fuelInjected: 26412, basePrice: "$31,545", avgCurrentPrice: "$18,000" },
      { year: 1990, total: 23646, coupe: 16016, convertible: 7630, manual: 4455, automatic: 19191, fuelInjected: 23646, basePrice: "$31,979", avgCurrentPrice: "$20,000" },
      { year: 1991, total: 20639, coupe: 14967, convertible: 5672, manual: 3823, automatic: 16816, fuelInjected: 20639, basePrice: "$32,455", avgCurrentPrice: "$20,000" },
      { year: 1992, total: 20479, coupe: 14604, convertible: 5875, manual: 3915, automatic: 16564, fuelInjected: 20479, basePrice: "$33,635", avgCurrentPrice: "$22,000" },
      { year: 1993, total: 21590, coupe: 15898, convertible: 5692, manual: 4478, automatic: 17112, fuelInjected: 21590, basePrice: "$34,595", avgCurrentPrice: "$22,000" },
      { year: 1994, total: 23330, coupe: 17984, convertible: 5346, manual: 5149, automatic: 18181, fuelInjected: 23330, basePrice: "$36,185", avgCurrentPrice: "$18,000" },
      { year: 1995, total: 20742, coupe: 15771, convertible: 4971, manual: 4829, automatic: 15913, fuelInjected: 20742, basePrice: "$36,785", avgCurrentPrice: "$18,000" },
      { year: 1996, total: 21536, coupe: 17167, convertible: 4369, manual: 5655, automatic: 15881, fuelInjected: 21536, basePrice: "$37,225", avgCurrentPrice: "$22,000" }
    ],
    totalProduced: 358180,
    totalConvertible: 74651,
    totalCoupe: 283529,
    totalManual: 63625,
    totalAutomatic: 294555,
    specialEditionsTotal: 6939,
    specialEditionsLabel: "ZR-1 Units Built",
    rarestYear: 1993,
    mostPopularColor: "Torch Red",
    rarestColor: "Dark Red Metallic",
    avgBasePrice: "$30,393"
  },
  {
    generationId: "c5",
    bodyStyles: ["Coupe", "Convertible", "Hardtop/Z06"],
    transmissions: ["6-speed Manual", "4-speed Automatic"],
    engines: ["346ci LS1 V8", "346ci LS6 V8"],
    notableFeatures: [
      "Hydroformed box frame",
      "Rear transaxle design",
      "LS1/LS6 Gen III small block",
      "Active Handling System"
    ],
    yearlyProduction: [
      { year: 1997, total: 9752, coupe: 9752, convertible: 0, manual: 5376, automatic: 4376, fuelInjected: 9752, basePrice: "$37,495", avgCurrentPrice: "$18,000" },
      { year: 1998, total: 31084, coupe: 19235, convertible: 11849, manual: 14489, automatic: 16595, fuelInjected: 31084, basePrice: "$37,495", avgCurrentPrice: "$18,000" },
      { year: 1999, total: 33270, coupe: 18078, convertible: 11948, manual: 15019, automatic: 18251, fuelInjected: 33270, basePrice: "$38,777", avgCurrentPrice: "$18,000" },
      { year: 2000, total: 33682, coupe: 18113, convertible: 13479, manual: 16254, automatic: 17428, fuelInjected: 33682, basePrice: "$39,280", avgCurrentPrice: "$20,000" },
      { year: 2001, total: 35627, coupe: 14173, convertible: 14467, manual: 19314, automatic: 16313, fuelInjected: 35627, basePrice: "$40,475", avgCurrentPrice: "$22,000" },
      { year: 2002, total: 35767, coupe: 13791, convertible: 14760, manual: 19826, automatic: 15941, fuelInjected: 35767, basePrice: "$41,005", avgCurrentPrice: "$24,000" },
      { year: 2003, total: 35469, coupe: 12218, convertible: 14022, manual: 20247, automatic: 15222, fuelInjected: 35469, basePrice: "$43,635", avgCurrentPrice: "$26,000" },
      { year: 2004, total: 34064, coupe: 11709, convertible: 12216, manual: 18858, automatic: 15206, fuelInjected: 34064, basePrice: "$44,245", avgCurrentPrice: "$28,000" }
    ],
    totalProduced: 248715,
    totalConvertible: 92741,
    totalCoupe: 117069,
    totalManual: 129383,
    totalAutomatic: 119332,
    specialEditionsTotal: 28387,
    specialEditionsLabel: "Z06 Units Built",
    rarestYear: 1997,
    mostPopularColor: "Torch Red",
    rarestColor: "Bowling Green Metallic",
    avgBasePrice: "$40,301"
  },
  {
    generationId: "c6",
    bodyStyles: ["Coupe", "Convertible", "Z06", "ZR1"],
    transmissions: ["6-speed Manual", "6-speed Automatic"],
    engines: ["364ci LS2 V8", "376ci LS3 V8", "427ci LS7 V8", "376ci LS9 V8 Supercharged"],
    notableFeatures: [
      "Exposed headlights return",
      "Aluminum frame Z06",
      "LS7 dry-sump 7.0L engine",
      "638hp supercharged ZR1"
    ],
    yearlyProduction: [
      { year: 2005, total: 37372, coupe: 26728, convertible: 10644, manual: 18687, automatic: 18685, fuelInjected: 37372, basePrice: "$43,710", avgCurrentPrice: "$28,000" },
      { year: 2006, total: 34021, coupe: 16598, convertible: 11151, manual: 20413, automatic: 13608, fuelInjected: 34021, basePrice: "$44,245", avgCurrentPrice: "$32,000" },
      { year: 2007, total: 40561, coupe: 21484, convertible: 11820, manual: 22309, automatic: 18252, fuelInjected: 40561, basePrice: "$44,995", avgCurrentPrice: "$30,000" },
      { year: 2008, total: 35310, coupe: 19031, convertible: 9572, manual: 17655, automatic: 17655, fuelInjected: 35310, basePrice: "$45,995", avgCurrentPrice: "$32,000" },
      { year: 2009, total: 16956, coupe: 9377, convertible: 5162, manual: 9495, automatic: 7461, fuelInjected: 16956, basePrice: "$48,565", avgCurrentPrice: "$38,000" },
      { year: 2010, total: 12194, coupe: 6953, convertible: 3615, manual: 6585, automatic: 5609, fuelInjected: 12194, basePrice: "$48,930", avgCurrentPrice: "$35,000" },
      { year: 2011, total: 13164, coupe: 7580, convertible: 3796, manual: 7109, automatic: 6055, fuelInjected: 13164, basePrice: "$49,525", avgCurrentPrice: "$38,000" },
      { year: 2012, total: 14132, coupe: 8362, convertible: 4050, manual: 7632, automatic: 6500, fuelInjected: 14132, basePrice: "$49,600", avgCurrentPrice: "$42,000" },
      { year: 2013, total: 11568, coupe: 6972, convertible: 3336, manual: 6247, automatic: 5321, fuelInjected: 11568, basePrice: "$49,600", avgCurrentPrice: "$45,000" }
    ],
    totalProduced: 215278,
    totalConvertible: 63146,
    totalCoupe: 123085,
    totalManual: 116132,
    totalAutomatic: 99146,
    specialEditionsTotal: 6189,
    specialEditionsLabel: "ZR1 Units Built",
    rarestYear: 2013,
    mostPopularColor: "Torch Red",
    rarestColor: "Cyber Gray Metallic",
    avgBasePrice: "$47,240"
  },
  {
    generationId: "c7",
    bodyStyles: ["Coupe", "Convertible", "Z06", "Grand Sport", "ZR1"],
    transmissions: ["7-speed Manual", "8-speed Automatic"],
    engines: ["376ci LT1 V8", "376ci LT4 V8 Supercharged", "376ci LT5 V8 Supercharged"],
    notableFeatures: [
      "Stingray name returns",
      "Removable roof panel standard",
      "650hp supercharged Z06",
      "755hp supercharged ZR1"
    ],
    yearlyProduction: [
      { year: 2014, total: 37288, coupe: 23923, convertible: 13365, manual: 11560, automatic: 25728, fuelInjected: 37288, basePrice: "$51,000", avgCurrentPrice: "$45,000" },
      { year: 2015, total: 34240, coupe: 15741, convertible: 9231, manual: 12654, automatic: 21586, fuelInjected: 34240, basePrice: "$55,000", avgCurrentPrice: "$48,000" },
      { year: 2016, total: 29995, coupe: 14177, convertible: 7942, manual: 10498, automatic: 19497, fuelInjected: 29995, basePrice: "$55,400", avgCurrentPrice: "$50,000" },
      { year: 2017, total: 32467, coupe: 14944, convertible: 8765, manual: 11365, automatic: 21102, fuelInjected: 32467, basePrice: "$55,450", avgCurrentPrice: "$52,000" },
      { year: 2018, total: 28439, coupe: 14631, convertible: 7423, manual: 8532, automatic: 19907, fuelInjected: 28439, basePrice: "$55,495", avgCurrentPrice: "$55,000" },
      { year: 2019, total: 27080, coupe: 14508, convertible: 6952, manual: 7854, automatic: 19226, fuelInjected: 27080, basePrice: "$55,900", avgCurrentPrice: "$58,000" }
    ],
    totalProduced: 189509,
    totalConvertible: 53678,
    totalCoupe: 97924,
    totalManual: 62463,
    totalAutomatic: 127046,
    specialEditionsTotal: 3147,
    specialEditionsLabel: "ZR1 Units Built",
    rarestYear: 2019,
    mostPopularColor: "Torch Red",
    rarestColor: "Admiral Blue",
    avgBasePrice: "$54,708"
  },
  {
    generationId: "c8",
    bodyStyles: ["Coupe", "Convertible", "Z06", "E-Ray"],
    transmissions: ["8-speed Dual Clutch"],
    engines: ["376ci LT2 V8", "346ci LT6 Flat-Plane V8", "376ci LT2 V8 + Electric Motor"],
    notableFeatures: [
      "First mid-engine Corvette",
      "Dual-clutch transmission only",
      "Flat-plane crank Z06",
      "E-Ray hybrid AWD"
    ],
    yearlyProduction: [
      { year: 2020, total: 20368, coupe: 15276, convertible: 5092, manual: 0, automatic: 20368, fuelInjected: 20368, basePrice: "$59,995", avgCurrentPrice: "$72,000" },
      { year: 2021, total: 27390, coupe: 18993, convertible: 8397, manual: 0, automatic: 27390, fuelInjected: 27390, basePrice: "$59,995", avgCurrentPrice: "$68,000" },
      { year: 2022, total: 34689, coupe: 22548, convertible: 12141, manual: 0, automatic: 34689, fuelInjected: 34689, basePrice: "$60,900", avgCurrentPrice: "$72,000" },
      { year: 2023, total: 53128, coupe: 31877, convertible: 21251, manual: 0, automatic: 53128, fuelInjected: 53128, basePrice: "$64,500", avgCurrentPrice: "$78,000" },
      { year: 2024, total: 64425, coupe: 38655, convertible: 25770, manual: 0, automatic: 64425, fuelInjected: 64425, basePrice: "$66,300", avgCurrentPrice: "$85,000" }
    ],
    totalProduced: 200000,
    totalConvertible: 72651,
    totalCoupe: 127349,
    totalManual: 0,
    totalAutomatic: 200000,
    specialEditionsTotal: 15000,
    specialEditionsLabel: "Z06 Units Built (Est.)",
    rarestYear: 2020,
    mostPopularColor: "Torch Red",
    rarestColor: "Hypersonic Gray",
    avgBasePrice: "$62,338"
  }
];

export const getProductionStatsByGenerationId = (generationId: string): ProductionStats | undefined => {
  return productionStatsData.find(stats => stats.generationId.toLowerCase() === generationId.toLowerCase());
};
