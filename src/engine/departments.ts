interface departmentData {
  name: string;
  formatted_name: string;
}

let departmentsData = {
  departments: {
    "2a": {
      name: "Corse-du-Sud",
      formatted_name: "corse-du-sud",
    },
    "2b": {
      name: "Haute-Corse",
      formatted_name: "haute-corse",
    },
    "01": {
      name: "Ain",
      formatted_name: "ain",
    },
    "02": {
      name: "Aisne",
      formatted_name: "aisne",
    },
    "03": {
      name: "Allier",
      formatted_name: "allier",
    },
    "04": {
      name: "Alpes-de-Haute Provence",
      formatted_name: "alpes-de-haute-provence",
    },
    "05": {
      name: "Hautes-Alpes",
      formatted_name: "hautes-alpes",
    },
    "06": {
      name: "Alpes Maritimes",
      formatted_name: "alpes-maritimes",
    },
    "07": {
      name: "Ard\u00e8che",
      formatted_name: "ardeche",
    },
    "08": {
      name: "Ardennes",
      formatted_name: "ardennes",
    },
    "09": {
      name: "Ari\u00e8ge",
      formatted_name: "ariege",
    },
    "10": {
      name: "Aube",
      formatted_name: "aube",
    },
    "11": {
      name: "Aude",
      formatted_name: "aude",
    },
    "12": {
      name: "Aveyron",
      formatted_name: "aveyron",
    },
    "13": {
      name: "Bouches-du-Rh\u00f4ne",
      formatted_name: "bouches-du-rhone",
    },
    "14": {
      name: "Calvados",
      formatted_name: "calvados",
    },
    "15": {
      name: "Cantal",
      formatted_name: "cantal",
    },
    "16": {
      name: "Charente",
      formatted_name: "charente",
    },
    "17": {
      name: "Charente-Maritime",
      formatted_name: "charente-maritime",
    },
    "18": {
      name: "Cher",
      formatted_name: "cher",
    },
    "19": {
      name: "Corr\u00e8ze",
      formatted_name: "correze",
    },
    "20": {
      name: "Corse",
      formatted_name: "corse",
    },
    "21": {
      name: "C\u00f4te d'Or",
      formatted_name: "cote-d-or",
    },
    "22": {
      name: "C\u00f4tes d'Armor",
      formatted_name: "cotes-d-armor",
    },
    "23": {
      name: "Creuse",
      formatted_name: "creuse",
    },
    "24": {
      name: "Dordogne",
      formatted_name: "dordogne",
    },
    "25": {
      name: "Doubs",
      formatted_name: "doubs",
    },
    "26": {
      name: "Dr\u00f4me",
      formatted_name: "drome",
    },
    "27": {
      name: "Eure",
      formatted_name: "eure",
    },
    "28": {
      name: "Eure-et-Loire",
      formatted_name: "eure-et-loire",
    },
    "29": {
      name: "Finist\u00e8re",
      formatted_name: "finistere",
    },
    "30": {
      name: "Gard",
      formatted_name: "gard",
    },
    "31": {
      name: "Haute-Garonne",
      formatted_name: "haute-garonne",
    },
    "32": {
      name: "Gers",
      formatted_name: "gers",
    },
    "33": {
      name: "Gironde",
      formatted_name: "gironde",
    },
    "34": {
      name: "H\u00e9rault",
      formatted_name: "herault",
    },
    "35": {
      name: "Ille-et-Vilaine",
      formatted_name: "ille-et-vilaine",
    },
    "36": {
      name: "Indre",
      formatted_name: "indre",
    },
    "37": {
      name: "Indre-et-Loire",
      formatted_name: "indre-et-loire",
    },
    "38": {
      name: "Is\u00e8re",
      formatted_name: "isere",
    },
    "39": {
      name: "Jura",
      formatted_name: "jura",
    },
    "40": {
      name: "Landes",
      formatted_name: "landes",
    },
    "41": {
      name: "Loir-et-Cher",
      formatted_name: "loir-et-cher",
    },
    "42": {
      name: "Loire",
      formatted_name: "loire",
    },
    "43": {
      name: "Haute-Loire",
      formatted_name: "haute-loire",
    },
    "44": {
      name: "Loire-Atlantique",
      formatted_name: "loire-atlantique",
    },
    "45": {
      name: "Loiret",
      formatted_name: "loiret",
    },
    "46": {
      name: "Lot",
      formatted_name: "lot",
    },
    "47": {
      name: "Lot-et-Garonne",
      formatted_name: "lot-et-garonne",
    },
    "48": {
      name: "Loz\u00e8re",
      formatted_name: "lozere",
    },
    "49": {
      name: "Maine-et-Loire",
      formatted_name: "maine-et-loire",
    },
    "50": {
      name: "Manche",
      formatted_name: "manche",
    },
    "51": {
      name: "Marne",
      formatted_name: "marne",
    },
    "52": {
      name: "Haute-Marne",
      formatted_name: "haute-marne",
    },
    "53": {
      name: "Mayenne",
      formatted_name: "mayenne",
    },
    "54": {
      name: "Meurthe-et-Moselle",
      formatted_name: "meurthe-et-moselle",
    },
    "55": {
      name: "Meuse",
      formatted_name: "meuse",
    },
    "56": {
      name: "Morbihan",
      formatted_name: "morbihan",
    },
    "57": {
      name: "Moselle",
      formatted_name: "moselle",
    },
    "58": {
      name: "Ni\u00e8vre",
      formatted_name: "nievre",
    },
    "59": {
      name: "Nord",
      formatted_name: "nord",
    },
    "60": {
      name: "Oise",
      formatted_name: "oise",
    },
    "61": {
      name: "Orne",
      formatted_name: "orne",
    },
    "62": {
      name: "Pas-de-Calais",
      formatted_name: "pas-de-calais",
    },
    "63": {
      name: "Puy-de-D\u00f4me",
      formatted_name: "puy-de-dome",
    },
    "64": {
      name: "Pyren\u00e9es-Atlantiques",
      formatted_name: "pyrenees-atlantiques",
    },
    "65": {
      name: "Hautes-Pyren\u00e9es",
      formatted_name: "hautes-pyrenees",
    },
    "66": {
      name: "Pyren\u00e9es-Orientales",
      formatted_name: "pyrenees-orientales",
    },
    "67": {
      name: "Bas-Rhin",
      formatted_name: "bas-rhin",
    },
    "68": {
      name: "Haut-Rhin",
      formatted_name: "haut-rhin",
    },
    "69": {
      name: "Rh\u00f4ne",
      formatted_name: "rhone",
    },
    "70": {
      name: "Haute-Sa\u00f4ne",
      formatted_name: "haute-saone",
    },
    "71": {
      name: "Sa\u00f4ne-et-Loire",
      formatted_name: "saone-et-loire",
    },
    "72": {
      name: "Sarthe",
      formatted_name: "sarthe",
    },
    "73": {
      name: "Savoie",
      formatted_name: "savoie",
    },
    "74": {
      name: "Haute-Savoie",
      formatted_name: "haute-savoie",
    },
    "75": {
      name: "Paris",
      formatted_name: "paris",
    },
    "76": {
      name: "Seine-Maritime",
      formatted_name: "seine-maritime",
    },
    "77": {
      name: "Seine-et-Marne",
      formatted_name: "seine-et-marne",
    },
    "78": {
      name: "Yvelines",
      formatted_name: "yvelines",
    },
    "79": {
      name: "Deux-S\u00e8vres",
      formatted_name: "deux-sevres",
    },
    "80": {
      name: "Somme",
      formatted_name: "somme",
    },
    "81": {
      name: "Tarn",
      formatted_name: "tarn",
    },
    "82": {
      name: "Tarn-et-Garonne",
      formatted_name: "tarn-et-garonne",
    },
    "83": {
      name: "Var",
      formatted_name: "var",
    },
    "84": {
      name: "Vaucluse",
      formatted_name: "vaucluse",
    },
    "85": {
      name: "Vend\u00e9e",
      formatted_name: "vendee",
    },
    "86": {
      name: "Vienne",
      formatted_name: "vienne",
    },
    "87": {
      name: "Haute-Vienne",
      formatted_name: "haute-vienne",
    },
    "88": {
      name: "Vosges",
      formatted_name: "vosges",
    },
    "89": {
      name: "Yonne",
      formatted_name: "yonne",
    },
    "90": {
      name: "Territoire de Belfort",
      formatted_name: "territoire-de-belfort",
    },
    "91": {
      name: "Essonne",
      formatted_name: "essonne",
    },
    "92": {
      name: "Hauts-de-Seine",
      formatted_name: "hauts-de-seine",
    },
    "93": {
      name: "Seine-Saint-Denis",
      formatted_name: "seine-saint-denis",
    },
    "94": {
      name: "Val-de-Marne",
      formatted_name: "val-de-marne",
    },
    "95": {
      name: "Val-d'Oise",
      formatted_name: "val-d-oise",
    },
    "971": {
      name: "Guadeloupe",
      formatted_name: "guadeloupe",
    },
    "972": {
      name: "Martinique",
      formatted_name: "martinique",
    },
    "973": {
      name: "Guyane",
      formatted_name: "guyane",
    },
    "974": {
      name: "La Réunion",
      formatted_name: "la-reunion",
    },
    "976": {
      name: "Mayotte",
      formatted_name: "mayotte",
    },
  },
};

export function getDepartmentName(deptIdx: string): string {
  let dept = (departmentsData.departments as any)[deptIdx];
  if (dept == null) {
    return "NA";
  }
  return (dept as departmentData).name;
}
