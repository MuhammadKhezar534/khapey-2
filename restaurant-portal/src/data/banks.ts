// Pakistani banks with their card types
export interface CardType {
  id: string
  name: string
}

export interface Bank {
  id: string
  name: string
  cardTypes: CardType[]
}

export const pakistaniBanks: Bank[] = [
  {
    id: "hbl",
    name: "HBL",
    cardTypes: [
      { id: "hbl-platinum", name: "Platinum Credit Card" },
      { id: "hbl-gold", name: "Gold Credit Card" },
      { id: "hbl-classic", name: "Classic Credit Card" },
      { id: "hbl-debit", name: "Debit Card" },
      { id: "hbl-cashback", name: "CashBack Credit Card" },
      { id: "hbl-fuel", name: "Fuel Saver Card" },
    ],
  },
  {
    id: "ubl",
    name: "UBL",
    cardTypes: [
      { id: "ubl-platinum", name: "Platinum Credit Card" },
      { id: "ubl-gold", name: "Gold Credit Card" },
      { id: "ubl-classic", name: "Classic Credit Card" },
      { id: "ubl-debit", name: "Debit Card" },
      { id: "ubl-wiz", name: "UBL Wiz Card" },
    ],
  },
  {
    id: "mcb",
    name: "MCB",
    cardTypes: [
      { id: "mcb-platinum", name: "Platinum Credit Card" },
      { id: "mcb-gold", name: "Gold Credit Card" },
      { id: "mcb-classic", name: "Classic Credit Card" },
      { id: "mcb-debit", name: "Debit Card" },
      { id: "mcb-lite", name: "MCB Lite Card" },
    ],
  },
  {
    id: "bank-alfalah",
    name: "Bank Alfalah",
    cardTypes: [
      { id: "alfalah-platinum", name: "Platinum Credit Card" },
      { id: "alfalah-gold", name: "Gold Credit Card" },
      { id: "alfalah-classic", name: "Classic Credit Card" },
      { id: "alfalah-debit", name: "Debit Card" },
      { id: "alfalah-islamic", name: "Islamic Credit Card" },
    ],
  },
  {
    id: "meezan",
    name: "Meezan Bank",
    cardTypes: [
      { id: "meezan-titanium", name: "Titanium Debit Card" },
      { id: "meezan-gold", name: "Gold Debit Card" },
      { id: "meezan-standard", name: "Standard Debit Card" },
    ],
  },
  {
    id: "allied",
    name: "Allied Bank",
    cardTypes: [
      { id: "allied-platinum", name: "Platinum Credit Card" },
      { id: "allied-gold", name: "Gold Credit Card" },
      { id: "allied-classic", name: "Classic Credit Card" },
      { id: "allied-debit", name: "Debit Card" },
    ],
  },
  {
    id: "askari",
    name: "Askari Bank",
    cardTypes: [
      { id: "askari-platinum", name: "Platinum Credit Card" },
      { id: "askari-gold", name: "Gold Credit Card" },
      { id: "askari-classic", name: "Classic Credit Card" },
      { id: "askari-debit", name: "Debit Card" },
    ],
  },
  {
    id: "bok",
    name: "Bank of Khyber",
    cardTypes: [
      { id: "bok-gold", name: "Gold Debit Card" },
      { id: "bok-classic", name: "Classic Debit Card" },
    ],
  },
  {
    id: "bop",
    name: "Bank of Punjab",
    cardTypes: [
      { id: "bop-platinum", name: "Platinum Debit Card" },
      { id: "bop-gold", name: "Gold Debit Card" },
      { id: "bop-classic", name: "Classic Debit Card" },
    ],
  },
  {
    id: "faysal",
    name: "Faysal Bank",
    cardTypes: [
      { id: "faysal-platinum", name: "Platinum Credit Card" },
      { id: "faysal-gold", name: "Gold Credit Card" },
      { id: "faysal-classic", name: "Classic Credit Card" },
      { id: "faysal-debit", name: "Debit Card" },
      { id: "faysal-islamic", name: "Islamic Credit Card" },
    ],
  },
  {
    id: "js",
    name: "JS Bank",
    cardTypes: [
      { id: "js-platinum", name: "Platinum Credit Card" },
      { id: "js-gold", name: "Gold Credit Card" },
      { id: "js-classic", name: "Classic Credit Card" },
      { id: "js-debit", name: "Debit Card" },
    ],
  },
  {
    id: "nbp",
    name: "National Bank of Pakistan",
    cardTypes: [
      { id: "nbp-gold", name: "Gold Debit Card" },
      { id: "nbp-classic", name: "Classic Debit Card" },
      { id: "nbp-paypak", name: "PayPak Debit Card" },
    ],
  },
  {
    id: "scb",
    name: "Standard Chartered",
    cardTypes: [
      { id: "scb-worldmiles", name: "WorldMiles Credit Card" },
      { id: "scb-platinum", name: "Platinum Credit Card" },
      { id: "scb-gold", name: "Gold Credit Card" },
      { id: "scb-classic", name: "Classic Credit Card" },
      { id: "scb-debit", name: "Debit Card" },
    ],
  },
  {
    id: "soneri",
    name: "Soneri Bank",
    cardTypes: [
      { id: "soneri-gold", name: "Gold Debit Card" },
      { id: "soneri-classic", name: "Classic Debit Card" },
    ],
  },
  {
    id: "summit",
    name: "Summit Bank",
    cardTypes: [
      { id: "summit-gold", name: "Gold Debit Card" },
      { id: "summit-classic", name: "Classic Debit Card" },
    ],
  },
]
