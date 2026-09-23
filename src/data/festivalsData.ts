export interface FestivalItem {
  id: string;
  day: number;
  month: number; // 0-indexed (0 = Jan, 6 = Jul, etc.)
  year: number;
  name: string;
  tithi: string;
  category: 'Major Festival' | 'Vrat & Upvas' | 'Jayanti' | 'Auspicious Day';
  description: string;
  colors: string[];
  daysLeft?: string;
}

// Complete 12-Month Hindu Festivals Database shared across Calendar & Festivals screens
export const ALL_FESTIVALS_DB: Record<string, FestivalItem[]> = {
  // January 2026 (Month 0)
  '0-2026': [
    { id: 'jan-1', day: 10, month: 0, year: 2026, name: 'Pausha Putrada Ekadashi', tithi: 'Pausha Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Sacred fast for progeny, family happiness, and divine grace of Lord Vishnu.', colors: ['#FF9933', '#D4AF37'], daysLeft: '10 Jan' },
    { id: 'jan-2', day: 14, month: 0, year: 2026, name: 'Makar Sankranti / Pongal', tithi: 'Sun enters Makara Rashi', category: 'Major Festival', description: 'Harvest festival celebrating the auspicious Uttarayana movement of Surya Dev.', colors: ['#FF7A00', '#FFD700'], daysLeft: '14 Jan' },
    { id: 'jan-3', day: 23, month: 0, year: 2026, name: 'Subhash Chandra Bose Jayanti', tithi: 'National Jayanti', category: 'Jayanti', description: 'Honoring Netaji Subhash Chandra Bose.', colors: ['#00B0FF', '#3F51B5'], daysLeft: '23 Jan' },
    { id: 'jan-4', day: 24, month: 0, year: 2026, name: 'Pausha Purnima', tithi: 'Full Moon Day', category: 'Major Festival', description: 'Holy river dip and Satyanarayan Vrat rituals.', colors: ['#8A2BE2', '#4B0082'], daysLeft: '24 Jan' },
  ],

  // February 2026 (Month 1)
  '1-2026': [
    { id: 'feb-1', day: 3, month: 1, year: 2026, name: 'Vasant Panchami', tithi: 'Magha Shukla Panchami', category: 'Major Festival', description: 'Worship of Goddess Saraswati, honoring knowledge, music, and wisdom.', colors: ['#FFD700', '#FF9933'], daysLeft: '03 Feb' },
    { id: 'feb-2', day: 8, month: 1, year: 2026, name: 'Jaya Ekadashi', tithi: 'Magha Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Powerful Vrat for washing away negative karma & spiritual elevation.', colors: ['#00B0FF', '#00E676'], daysLeft: '08 Feb' },
    { id: 'feb-3', day: 12, month: 1, year: 2026, name: 'Guru Ravidas Jayanti', tithi: 'Magha Purnima', category: 'Jayanti', description: 'Birth anniversary of Sant Guru Ravidas.', colors: ['#E91E63', '#FF4081'], daysLeft: '12 Feb' },
    { id: 'feb-4', day: 26, month: 1, year: 2026, name: 'Maha Shivaratri', tithi: 'Magha Krishna Chaturdashi', category: 'Major Festival', description: 'Great night of Lord Shiva celebrated with night-long Abhishekam and fasting.', colors: ['#4B0082', '#000000'], daysLeft: '26 Feb' },
  ],

  // March 2026 (Month 2)
  '2-2026': [
    { id: 'mar-1', day: 10, month: 2, year: 2026, name: 'Amalaki Ekadashi', tithi: 'Phalguna Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Sacred worship of Amla tree and Lord Vishnu for health and prosperity.', colors: ['#00E676', '#D4AF37'], daysLeft: '10 Mar' },
    { id: 'mar-2', day: 14, month: 2, year: 2026, name: 'Holika Dahan', tithi: 'Phalguna Purnima', category: 'Major Festival', description: 'Bonfire ritual symbolizing victory of Prahlad and righteousness over evil.', colors: ['#FF5252', '#FF7A00'], daysLeft: '14 Mar' },
    { id: 'mar-3', day: 15, month: 2, year: 2026, name: 'Holi (Dhulandi)', tithi: 'Chaitra Pratipada', category: 'Major Festival', description: 'Vibrant festival of colors celebrating divine joy and spring season.', colors: ['#E91E63', '#FF4081'], daysLeft: '15 Mar' },
    { id: 'mar-4', day: 29, month: 2, year: 2026, name: 'Chaitra Navratri / Ugadi', tithi: 'Chaitra Shukla Pratipada', category: 'Major Festival', description: 'Vedic New Year and start of 9 sacred days of Goddess Durga worship.', colors: ['#FF9933', '#D4AF37'], daysLeft: '29 Mar' },
  ],

  // April 2026 (Month 3)
  '3-2026': [
    { id: 'apr-1', day: 6, month: 3, year: 2026, name: 'Rama Navami', tithi: 'Chaitra Shukla Navami', category: 'Jayanti', description: 'Divine appearance day of Maryada Purushottam Bhagavan Shri Rama.', colors: ['#FF7A00', '#D4AF37'], daysLeft: '06 Apr' },
    { id: 'apr-2', day: 8, month: 3, year: 2026, name: 'Kamada Ekadashi', tithi: 'Chaitra Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Auspicious fast fulfilling noble desires and spiritual liberation.', colors: ['#00B0FF', '#3F51B5'], daysLeft: '08 Apr' },
    { id: 'apr-3', day: 13, month: 3, year: 2026, name: 'Hanuman Jayanti', tithi: 'Chaitra Purnima', category: 'Jayanti', description: 'Birth celebration of Lord Hanuman, embodiment of devotion and strength.', colors: ['#FF5252', '#FF7A00'], daysLeft: '13 Apr' },
    { id: 'apr-4', day: 20, month: 3, year: 2026, name: 'Mahavir Jayanti', tithi: 'Chaitra Shukla Trayodashi', category: 'Jayanti', description: 'Birth anniversary of Bhagavan Mahavira, preaching Ahimsa.', colors: ['#FFD700', '#8A2BE2'], daysLeft: '20 Apr' },
  ],

  // May 2026 (Month 4)
  '4-2026': [
    { id: 'may-1', day: 8, month: 4, year: 2026, name: 'Mohini Ekadashi', tithi: 'Vaisakha Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Commemorating the Mohini Avatar of Lord Vishnu.', colors: ['#FF9933', '#D4AF37'], daysLeft: '08 May' },
    { id: 'may-2', day: 12, month: 4, year: 2026, name: 'Buddha Purnima', tithi: 'Vaisakha Purnima', category: 'Jayanti', description: 'Birth, enlightenment, and Mahaparinirvana of Gautama Buddha.', colors: ['#00B0FF', '#00E676'], daysLeft: '12 May' },
    { id: 'may-3', day: 21, month: 4, year: 2026, name: 'Narasimha Jayanti', tithi: 'Vaisakha Shukla Chaturdashi', category: 'Jayanti', description: 'Appearance day of Lord Narasimha protecting Bhakta Prahlad.', colors: ['#FF5252', '#D4AF37'], daysLeft: '21 May' },
  ],

  // June 2026 (Month 5)
  '5-2026': [
    { id: 'jun-1', day: 6, month: 5, year: 2026, name: 'Nirjala Ekadashi', tithi: 'Jyeshtha Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Waterless fast granting spiritual merits of all 24 Ekadashis combined.', colors: ['#D4AF37', '#FF9933'], daysLeft: '06 Jun' },
    { id: 'jun-2', day: 14, month: 5, year: 2026, name: 'Vat Savitri Vrat', tithi: 'Jyeshtha Amavasya', category: 'Vrat & Upvas', description: 'Women pray at Banyan tree for spouse longevity, honoring Savitri.', colors: ['#E91E63', '#FF4081'], daysLeft: '14 Jun' },
  ],

  // July 2026 (Month 6)
  '6-2026': [
    { id: 'jul-1', day: 5, month: 6, year: 2026, name: 'Devshayani Ekadashi', tithi: 'Ashadha Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Lord Vishnu begins 4 months of cosmic sleep (Chaturmas).', colors: ['#FF9933', '#D4AF37'], daysLeft: '05 Jul' },
    { id: 'jul-2', day: 14, month: 6, year: 2026, name: 'Guru Purnima', tithi: 'Ashadha Purnima', category: 'Major Festival', description: 'Sacred day honoring Maharshi Ved Vyas and spiritual gurus.', colors: ['#8A2BE2', '#4B0082'], daysLeft: '14 Jul' },
    { id: 'jul-3', day: 20, month: 6, year: 2026, name: 'Gauri Vrat Begins', tithi: 'Shukla Dashami', category: 'Vrat & Upvas', description: 'Sacred fast observed for marital bliss & wellbeing.', colors: ['#E91E63', '#FF4081'], daysLeft: '20 Jul' },
    { id: 'jul-4', day: 24, month: 6, year: 2026, name: 'Kamika Ekadashi', tithi: 'Shravana Krishna Ekadashi', category: 'Vrat & Upvas', description: 'Fasting for liberation and divine blessings of Bhagavan Vishnu.', colors: ['#00B0FF', '#3F51B5'], daysLeft: '24 Jul' },
    { id: 'jul-5', day: 29, month: 6, year: 2026, name: 'Hariyali Amavasya', tithi: 'Shravana Amavasya', category: 'Auspicious Day', description: 'Ancestor rites, tree planting and Lord Shiva worship.', colors: ['#00E676', '#D4AF37'], daysLeft: '29 Jul' },
  ],

  // August 2026 (Month 7)
  '7-2026': [
    { id: 'aug-1', day: 3, month: 7, year: 2026, name: 'Hariyali Teej', tithi: 'Shravana Shukla Tritiya', category: 'Major Festival', description: 'Women pray for marital happiness & honor Goddess Parvati.', colors: ['#00B0FF', '#00E676'], daysLeft: '03 Aug' },
    { id: 'aug-2', day: 7, month: 7, year: 2026, name: 'Nag Panchami', tithi: 'Shravana Shukla Panchami', category: 'Vrat & Upvas', description: 'Worship of Serpent Deities for divine protection.', colors: ['#FF5252', '#FF7A00'], daysLeft: '07 Aug' },
    { id: 'aug-3', day: 12, month: 7, year: 2026, name: 'Putrada Ekadashi', tithi: 'Shravana Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Auspicious fast for progeny and family prosperity.', colors: ['#D4AF37', '#FF9933'], daysLeft: '12 Aug' },
    { id: 'aug-4', day: 15, month: 7, year: 2026, name: 'Raksha Bandhan', tithi: 'Shravana Purnima', category: 'Major Festival', description: 'Sacred brother-sister bond of love and protection.', colors: ['#E91E63', '#FF4081'], daysLeft: '15 Aug' },
    { id: 'aug-5', day: 28, month: 7, year: 2026, name: 'Krishna Janmashtami', tithi: 'Bhadrapada Krishna Ashtami', category: 'Jayanti', description: 'Divine birth of Bhagavan Shri Krishna celebrated at midnight.', colors: ['#3F51B5', '#2196F3'], daysLeft: '28 Aug' },
  ],

  // September 2026 (Month 8)
  '8-2026': [
    { id: 'sep-1', day: 5, month: 8, year: 2026, name: 'Ganesh Chaturthi', tithi: 'Bhadrapada Shukla Chaturthi', category: 'Major Festival', description: 'Grand arrival of Lord Ganesha for 10 auspicious days.', colors: ['#FF9933', '#E65100'], daysLeft: '05 Sep' },
    { id: 'sep-2', day: 12, month: 8, year: 2026, name: 'Rishi Panchami', tithi: 'Bhadrapada Shukla Panchami', category: 'Vrat & Upvas', description: 'Expressing gratitude to Saptarishis (Seven Sages).', colors: ['#00E676', '#D4AF37'], daysLeft: '12 Sep' },
    { id: 'sep-3', day: 14, month: 8, year: 2026, name: 'Radha Ashtami', tithi: 'Bhadrapada Shukla Ashtami', category: 'Jayanti', description: 'Divine appearance day of Goddess Radha Rani.', colors: ['#E91E63', '#FF4081'], daysLeft: '14 Sep' },
    { id: 'sep-4', day: 20, month: 8, year: 2026, name: 'Anant Chaturdashi', tithi: 'Bhadrapada Shukla Chaturdashi', category: 'Major Festival', description: 'Ganesh Visarjan and Ananta Vrat worship.', colors: ['#00B0FF', '#3F51B5'], daysLeft: '20 Sep' },
  ],

  // October 2026 (Month 9)
  '9-2026': [
    { id: 'oct-1', day: 11, month: 9, year: 2026, name: 'Sharad Navratri Begins', tithi: 'Ashvin Shukla Pratipada', category: 'Major Festival', description: 'Nine holy nights celebrating Nine Forms of Goddess Durga.', colors: ['#FF9933', '#D4AF37'], daysLeft: '11 Oct' },
    { id: 'oct-2', day: 21, month: 9, year: 2026, name: 'Dussehra (Vijayadashami)', tithi: 'Ashvin Shukla Dashami', category: 'Major Festival', description: 'Triumph of Lord Rama over Ravana and Durga over Mahishasura.', colors: ['#FF5252', '#D4AF37'], daysLeft: '21 Oct' },
    { id: 'oct-3', day: 29, month: 9, year: 2026, name: 'Karwa Chauth', tithi: 'Ashvin Krishna Chaturthi', category: 'Vrat & Upvas', description: 'Fasting from sunrise to moonrise for husband longevity & happiness.', colors: ['#E91E63', '#FF9933'], daysLeft: '29 Oct' },
  ],

  // November 2026 (Month 10)
  '10-2026': [
    { id: 'nov-1', day: 8, month: 10, year: 2026, name: 'Dhanteras', tithi: 'Kartika Krishna Trayodashi', category: 'Major Festival', description: 'Worship of Lord Dhanvantari and Goddess Lakshmi for health & wealth.', colors: ['#FFD700', '#FF9933'], daysLeft: '08 Nov' },
    { id: 'nov-2', day: 10, month: 10, year: 2026, name: 'Diwali (Lakshmi Puja)', tithi: 'Kartika Amavasya', category: 'Major Festival', description: 'Festival of lights commemorating Lord Rama return to Ayodhya.', colors: ['#FF7A00', '#FFD700'], daysLeft: '10 Nov' },
    { id: 'nov-3', day: 12, month: 10, year: 2026, name: 'Govardhan Puja / Bhai Dooj', tithi: 'Kartika Shukla Dwitiya', category: 'Major Festival', description: 'Worship of Govardhan hill and sisterly blessings for brothers.', colors: ['#00B0FF', '#8A2BE2'], daysLeft: '12 Nov' },
    { id: 'nov-4', day: 21, month: 10, year: 2026, name: 'Devutthana Ekadashi', tithi: 'Kartika Shukla Ekadashi', category: 'Vrat & Upvas', description: 'Lord Vishnu awakens from Chaturmas sleep; start of wedding season.', colors: ['#D4AF37', '#FF9933'], daysLeft: '21 Nov' },
  ],

  // December 2026 (Month 11)
  '11-2026': [
    { id: 'dec-1', day: 5, month: 11, year: 2026, name: 'Utpanna Ekadashi', tithi: 'Margashirsha Krishna Ekadashi', category: 'Vrat & Upvas', description: 'Origin day of Ekadashi Devi from Lord Vishnu.', colors: ['#00B0FF', '#3F51B5'], daysLeft: '05 Dec' },
    { id: 'dec-2', day: 20, month: 11, year: 2026, name: 'Gita Jayanti', tithi: 'Margashirsha Shukla Ekadashi', category: 'Jayanti', description: 'Commemorating Shri Krishna delivering Bhagavad Gita to Arjuna.', colors: ['#FF9933', '#D4AF37'], daysLeft: '20 Dec' },
    { id: 'dec-3', day: 23, month: 11, year: 2026, name: 'Dattatreya Jayanti', tithi: 'Margashirsha Purnima', category: 'Jayanti', description: 'Appearance day of Lord Dattatreya (Trimurti Avatar).', colors: ['#8A2BE2', '#D4AF37'], daysLeft: '23 Dec' },
  ]
};

export const getFestivalsForMonthAndYear = (month: number, year: number): FestivalItem[] => {
  const key = `${month}-${year}`;
  if (ALL_FESTIVALS_DB[key]) {
    return ALL_FESTIVALS_DB[key];
  }

  // Fallback default festivals generator for any arbitrary month/year combination
  const monthNamesList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mName = monthNamesList[month] || 'Month';
  const shortM = mName.substring(0, 3);

  return [
    {
      id: `gen-1-${key}`,
      day: 11,
      month,
      year,
      name: `${mName} Shukla Ekadashi Vrat`,
      tithi: 'Shukla Paksha Ekadashi',
      category: 'Vrat & Upvas',
      description: `Sacred monthly fasting for Bhagavan Vishnu & Shiva worship in ${mName} ${year}.`,
      colors: ['#D4AF37', '#FF9933'],
      daysLeft: `11 ${shortM}`,
    },
    {
      id: `gen-2-${key}`,
      day: 18,
      month,
      year,
      name: `${mName} Pradosh Vrat`,
      tithi: 'Trayodashi Tithi',
      category: 'Vrat & Upvas',
      description: `Evening Pradosham Shiva Puja and fast for peace and prosperity.`,
      colors: ['#00B0FF', '#3F51B5'],
      daysLeft: `18 ${shortM}`,
    },
    {
      id: `gen-3-${key}`,
      day: 25,
      month,
      year,
      name: `${mName} Satyanarayan Purnima`,
      tithi: 'Full Moon Day',
      category: 'Major Festival',
      description: `Satyanarayan Vrat and divine holy bath rituals for ${mName} ${year}.`,
      colors: ['#8A2BE2', '#4B0082'],
      daysLeft: `25 ${shortM}`,
    }
  ];
};
