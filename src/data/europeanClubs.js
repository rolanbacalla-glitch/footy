/**
 * Major European Club Tactical Metadata (UEFA Champions League, Europa League, Conference League)
 * Tier-2 lookup used when Premier League clubs face continental opponents.
 */

export const EUROPEAN_CLUBS = {
  "86": {
    id: "86",
    name: "Real Madrid",
    shortName: "RMA",
    manager: "Xabi Alonso",
    formation: "4-3-3",
    tacticalStyle: "Vertical Transition & Star-Driven Positional Fluidity",
    stadium: "Santiago Bernabéu",
  },
  "83": {
    id: "83",
    name: "Barcelona",
    shortName: "BAR",
    manager: "Hansi Flick",
    formation: "4-2-3-1",
    tacticalStyle: "Aggressive High Line & Direct Vertical Pressing",
    stadium: "Spotify Camp Nou",
  },
  "132": {
    id: "132",
    name: "Bayern Munich",
    shortName: "BAY",
    manager: "Vincent Kompany",
    formation: "4-2-3-1",
    tacticalStyle: "Man-Oriented High Press & Wing Overloads",
    stadium: "Allianz Arena",
  },
  "160": {
    id: "160",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    manager: "Luis Enrique",
    formation: "4-3-3",
    tacticalStyle: "Possession Dominance & Inverted Full-Back Progression",
    stadium: "Parc des Princes",
  },
  "110": {
    id: "110",
    name: "Inter Milan",
    shortName: "INT",
    manager: "Simone Inzaghi",
    formation: "3-5-2",
    tacticalStyle: "Fluid Back-Three Rotations & Wing-Back Overloads",
    stadium: "San Siro",
  },
  "103": {
    id: "103",
    name: "AC Milan",
    shortName: "MIL",
    manager: "Sérgio Conceição",
    formation: "4-2-3-1",
    tacticalStyle: "Direct Counter-Attacking & Wide Isolation",
    stadium: "San Siro",
  },
  "111": {
    id: "111",
    name: "Juventus",
    shortName: "JUV",
    manager: "Igor Tudor",
    formation: "3-4-2-1",
    tacticalStyle: "Compact Mid-Block & Structured Ball Progression",
    stadium: "Allianz Stadium",
  },
  "1068": {
    id: "1068",
    name: "Atlético Madrid",
    shortName: "ATM",
    manager: "Diego Simeone",
    formation: "4-4-2",
    tacticalStyle: "Compact Defensive Block & Clinical Transitions",
    stadium: "Riyadh Air Metropolitano",
  },
  "124": {
    id: "124",
    name: "Borussia Dortmund",
    shortName: "BVB",
    manager: "Niko Kovač",
    formation: "4-2-3-1",
    tacticalStyle: "High-Tempo Vertical Transitions & Counter-Pressing",
    stadium: "Signal Iduna Park",
  },
  "131": {
    id: "131",
    name: "Bayer Leverkusen",
    shortName: "B04",
    manager: "Bayer 04 Head Coach",
    formation: "3-4-2-1",
    tacticalStyle: "Positional Rotations & Half-Space Combinations",
    stadium: "BayArena",
  },
  "114": {
    id: "114",
    name: "Napoli",
    shortName: "NAP",
    manager: "Antonio Conte",
    formation: "3-5-2",
    tacticalStyle: "Structured Build-Up & Relentless Pressing",
    stadium: "Stadio Diego Armando Maradona",
  },
  "105": {
    id: "105",
    name: "Atalanta",
    shortName: "ATA",
    manager: "Gian Piero Gasperini",
    formation: "3-4-1-2",
    tacticalStyle: "Man-to-Man Full-Pitch Pressing & Direct Overloads",
    stadium: "Gewiss Stadium",
  },
  "104": {
    id: "104",
    name: "AS Roma",
    shortName: "ROM",
    manager: "AS Roma Head Coach",
    formation: "3-4-2-1",
    tacticalStyle: "Compact Mid-Block & Progressive Wing-Backs",
    stadium: "Stadio Olimpico",
  },
  "1929": {
    id: "1929",
    name: "Benfica",
    shortName: "BEN",
    manager: "Bruno Lage",
    formation: "4-3-3",
    tacticalStyle: "High Pressing & Technical Combination Play",
    stadium: "Estádio da Luz",
  },
  "437": {
    id: "437",
    name: "FC Porto",
    shortName: "POR",
    manager: "FC Porto Head Coach",
    formation: "4-3-3",
    tacticalStyle: "Aggressive Counter-Pressing & Direct Wide Play",
    stadium: "Estádio do Dragão",
  },
  "2250": {
    id: "2250",
    name: "Sporting CP",
    shortName: "SCP",
    manager: "Rui Borges",
    formation: "3-4-3",
    tacticalStyle: "High-Intensity Back-Three Press & Vertical Runs",
    stadium: "Estádio José Alvalade",
  },
  "139": {
    id: "139",
    name: "Ajax",
    shortName: "AJA",
    manager: "Francesco Farioli",
    formation: "4-3-3",
    tacticalStyle: "Positional Play & Structured Build-Up from the Back",
    stadium: "Johan Cruijff ArenA",
  },
  "148": {
    id: "148",
    name: "PSV Eindhoven",
    shortName: "PSV",
    manager: "Peter Bosz",
    formation: "4-3-3",
    tacticalStyle: "Ultra-High Counter-Press & Relentless Attacking Tempo",
    stadium: "Philips Stadion",
  },
  "142": {
    id: "142",
    name: "Feyenoord",
    shortName: "FEY",
    manager: "Robin van Persie",
    formation: "4-2-3-1",
    tacticalStyle: "High-Tempo Pressing & Direct Wing Progression",
    stadium: "De Kuip",
  },
  "176": {
    id: "176",
    name: "Olympique de Marseille",
    shortName: "OM",
    manager: "Roberto De Zerbi",
    formation: "4-2-3-1",
    tacticalStyle: "Artificial Transitions & Bait-the-Press Build-Up",
    stadium: "Stade Vélodrome",
  },
  "256": {
    id: "256",
    name: "Celtic",
    shortName: "CEL",
    manager: "Brendan Rodgers",
    formation: "4-3-3",
    tacticalStyle: "High-Tempo Possession & Wide Overloads",
    stadium: "Celtic Park",
  },
};

export function getEuropeanClubInfo(teamIdentifier) {
  if (!teamIdentifier) return null;
  const idStr = String(teamIdentifier);
  if (EUROPEAN_CLUBS[idStr]) {
    return EUROPEAN_CLUBS[idStr];
  }

  const normalised = idStr.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const info of Object.values(EUROPEAN_CLUBS)) {
    const clubNorm = info.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clubNorm.includes(normalised) || normalised.includes(clubNorm)) {
      return info;
    }
  }
  return null;
}
