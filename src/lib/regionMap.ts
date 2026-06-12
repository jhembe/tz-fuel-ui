/** Maps normalised district keys (lowercase, no extra punctuation) to Tanzania region names. */
export const DISTRICT_REGION: Record<string, string> = {
  // Dar es Salaam
  'dar es salaam': 'Dar es Salaam',
  // Arusha
  'arusha': 'Arusha', 'arumeru': 'Arusha', 'arumeru (usa river)': 'Arusha',
  'monduli': 'Arusha', 'monduli-makuyuni': 'Arusha', 'monduli (makuyuni)': 'Arusha',
  'longido': 'Arusha', 'karatu': 'Arusha', 'ngorongoro': 'Arusha',
  'ngorongoro (loliondo)': 'Arusha', 'simanjiro': 'Arusha', 'simanjiro (orkasumet)': 'Arusha',
  // Kilimanjaro
  'moshi': 'Kilimanjaro', 'kilimanjaro (moshi)': 'Kilimanjaro',
  'hai': 'Kilimanjaro', "hai (bomang'ombe)": 'Kilimanjaro',
  'same': 'Kilimanjaro', 'mwanga': 'Kilimanjaro', 'rombo': 'Kilimanjaro',
  'rombo (mkuu)': 'Kilimanjaro', 'siha': 'Kilimanjaro', 'siha (sanya juu)': 'Kilimanjaro',
  // Manyara
  'babati': 'Manyara', 'manyara (babati)': 'Manyara', 'mbulu': 'Manyara',
  'hanang': 'Manyara', 'hanang (katesh)': 'Manyara', 'kiteto': 'Manyara',
  'kiteto (kibaya)': 'Manyara',
  // Tanga
  'tanga': 'Tanga', 'pangani': 'Tanga', 'p angani': 'Tanga',
  'handeni': 'Tanga', 'h andeni': 'Tanga', 'kilindi': 'Tanga', 'k ilindi': 'Tanga',
  'korogwe': 'Tanga', 'k orogwe': 'Tanga', 'lushoto': 'Tanga', 'l ushoto': 'Tanga',
  'bumbuli': 'Tanga', 'b umbuli': 'Tanga', 'muheza': 'Tanga',
  // Morogoro
  'morogoro': 'Morogoro', 'm orogoro': 'Morogoro', 'kilosa': 'Morogoro', 'k ilosa': 'Morogoro',
  'kilombero (ifakara)': 'Morogoro', 'k ilombero (ifakara)': 'Morogoro',
  'kilombero (mlimba)': 'Morogoro', 'k ilombero (mlimba)': 'Morogoro',
  'kilombero (mngeta)': 'Morogoro', 'k ilombero (mngeta)': 'Morogoro',
  'ulanga (mahenge)': 'Morogoro', 'u langa (mahenge)': 'Morogoro',
  'mvomero': 'Morogoro', 'm vomero (sanga sanga)': 'Morogoro', 'm vomero (wami sokoine)': 'Morogoro',
  'gairo': 'Morogoro', 'g airo': 'Morogoro', 'mikumi': 'Morogoro', 'm ikumi': 'Morogoro',
  'malinyi': 'Morogoro', 'm alinyi': 'Morogoro',
  // Pwani (Coast)
  'kibaha': 'Pwani', 'pwani (kibaha)': 'Pwani', 'bagamoyo': 'Pwani',
  'bagamoyo (mbwewe)': 'Pwani', 'bagamoyo (miono)': 'Pwani',
  'chalinze junction': 'Pwani', 'chalinze township (msata)': 'Pwani',
  'kisarawe': 'Pwani', 'mkuranga': 'Pwani', 'rufiji': 'Pwani', 'kibiti': 'Pwani',
  'mafia': 'Pwani',
  // Dodoma
  'dodoma': 'Dodoma', 'chamwino': 'Dodoma', 'chamwino (mlowa)': 'Dodoma',
  'bahi': 'Dodoma', 'kondoa': 'Dodoma', 'chemba': 'Dodoma', 'kongwa': 'Dodoma',
  'mpwapwa': 'Dodoma', 'mpwapwa (chipogoro)': 'Dodoma',
  'mvumi': 'Dodoma', 'mtera (makatopora)': 'Dodoma',
  // Singida
  'singida': 'Singida', 's ingida': 'Singida', 'ikungi': 'Singida', 'i kungi': 'Singida',
  'manyoni': 'Singida', 'm anyoni': 'Singida', 'iramba': 'Singida', 'i ramba': 'Singida',
  'itigi (mitundu)': 'Singida', 'i tigi (mitundu)': 'Singida',
  'itigi (rungwa)': 'Singida', 'i tigi (rungwa)': 'Singida',
  // Tabora
  'tabora': 'Tabora', 't abora': 'Tabora', 'sikonge': 'Tabora', 's ikonge': 'Tabora',
  'urambo': 'Tabora', 'u rambo': 'Tabora', 'kaliua': 'Tabora', 'k aliua': 'Tabora',
  'uyui': 'Tabora', 'u yui': 'Tabora', 'nzega': 'Tabora', 'n zega': 'Tabora',
  'igunga': 'Tabora', 'i gunga': 'Tabora',
  // Shinyanga
  'shinyanga': 'Shinyanga', 's hinyanga': 'Shinyanga',
  'kahama': 'Shinyanga', 'k ahama': 'Shinyanga',
  'kishapu': 'Shinyanga', 'k ishapu': 'Shinyanga',
  'msalala': 'Shinyanga', 'm salala': 'Shinyanga',
  // Geita
  'geita': 'Geita', 'chato': 'Geita', 'bukombe': 'Geita', 'mbogwe': 'Geita',
  "nyang'hwale": 'Geita', 'katoro': 'Geita',
  // Mwanza
  'mwanza': 'Mwanza', 'm wanza': 'Mwanza', 'ukerewe': 'Mwanza', 'u kerewe': 'Mwanza',
  'kwimba': 'Mwanza', 'k wimba': 'Mwanza', 'magu': 'Mwanza', 'm agu': 'Mwanza',
  'sengerema': 'Mwanza', 's engerema': 'Mwanza',
  'misungwi': 'Mwanza', 'm isungwi': 'Mwanza', 'm isungwi (mbarika)': 'Mwanza',
  // Simiyu
  'bariadi': 'Simiyu', 'maswa': 'Simiyu', 'm aswa': 'Simiyu',
  'meatu': 'Simiyu', 'm eatu (mwanhuzi)': 'Simiyu',
  'busega (nyashimo)': 'Simiyu', 'b usega (nyashimo)': 'Simiyu',
  'itilima (lagangabilili)': 'Simiyu', 'i tilima (lagangabilili)': 'Simiyu',
  's imiyu (bariadi)': 'Simiyu',
  // Mara
  'musoma': 'Mara', 'mara (musoma)': 'Mara', 'musoma vijijini (busekela)': 'Mara',
  'bunda': 'Mara', 'bunda (kisorya)': 'Mara', 'butiama': 'Mara',
  'rorya (ingirijuu)': 'Mara', 'rorya (shirati)': 'Mara',
  'tarime': 'Mara', 'tarime (kewanja/nyamongo)': 'Mara',
  'serengeti (mugumu)': 'Mara',
  // Kagera
  'bukoba': 'Kagera', 'kagera (bukoba)': 'Kagera', 'biharamulo': 'Kagera',
  'muleba': 'Kagera', 'misenyi': 'Kagera', 'ngara': 'Kagera',
  'karagwe (kayanga)': 'Kagera', 'kyerwa (ruberwa)': 'Kagera', 'kakonko': 'Kagera',
  'b urugwa': 'Kagera',
  // Kigoma
  'kigoma': 'Kigoma', 'kasulu': 'Kigoma', 'kibondo': 'Kigoma',
  'buhigwe': 'Kigoma', 'uvinza (lugufu)': 'Kigoma',
  'muyobozi village (uvinza)': 'Kigoma', 'ilagala village (uvinza)': 'Kigoma',
  'kihungwe': 'Kigoma', 'kabwe': 'Kigoma', 'k abwe': 'Kigoma',
  'tanganyika (ikola)': 'Kigoma',
  // Katavi
  'mpanda': 'Katavi', 'katavi (mpanda)': 'Katavi',
  'mlele (inyonga)': 'Katavi', 'mpimbwe (majimoto)': 'Katavi',
  'nsimbo': 'Katavi', 'n simbo': 'Katavi',
  // Rukwa
  'sumbawanga': 'Rukwa', 'r ukwa (sumbawanga)': 'Rukwa',
  'kalambo (matai)': 'Rukwa', 'k alambo (matai)': 'Rukwa',
  'nkasi (kirando)': 'Rukwa', 'n kasi (kirando)': 'Rukwa',
  'nkasi (namanyele)': 'Rukwa', 'n kasi (namanyele)': 'Rukwa',
  's umbawanga rural (mtowisa)': 'Rukwa',
  // Mbeya
  'mbeya': 'Mbeya', 'rungwe (tukuyu)': 'Mbeya', 'r ungwe (tukuyu)': 'Mbeya',
  'kyela': 'Mbeya', 'busokelo (lwangwa)': 'Mbeya', 'b usokelo (lwangwa)': 'Mbeya',
  'mbarali (rujewa)': 'Mbeya', 'rujewa (kapunga)': 'Mbeya', 'rujewa (madibira)': 'Mbeya',
  // Songwe
  'vwawa': 'Songwe', 'mbozi (vwawa)': 'Songwe', 's ongwe (vwawa)': 'Songwe',
  's ongwe (mkwajuni)': 'Songwe',
  'momba': 'Songwe', 'm omba (chitete)': 'Songwe', 'ileje': 'Songwe', 'i leje': 'Songwe',
  // Iringa
  'iringa': 'Iringa', 'kilolo': 'Iringa', 'mufindi (igowole)': 'Iringa',
  'mufindi (mafinga)': 'Iringa', 'mufindi (mgololo)': 'Iringa',
  'ismani': 'Iringa',
  // Njombe
  'njombe': 'Njombe', 'n jombe': 'Njombe', 'n jombe (kidegembye)': 'Njombe',
  "wanging'ombe (igwachanya)": 'Njombe', "w anging'ombe (igwachanya)": 'Njombe',
  'makete': 'Njombe', 'm akete': 'Njombe',
  'ludewa': 'Njombe', 'l udewa': 'Njombe', 'l ukozi': 'Njombe',
  'nyasa (mbamba bay)': 'Njombe', 'n yasa (mbamba bay)': 'Njombe',
  // Ruvuma
  'songea': 'Ruvuma', 'r uvuma (songea)': 'Ruvuma',
  'mbinga': 'Ruvuma', 'm binga': 'Ruvuma',
  'tunduru': 'Ruvuma', 't unduru': 'Ruvuma',
  'namtumbo': 'Ruvuma', 'n amtumbo': 'Ruvuma',
  'nyasa': 'Ruvuma', 'n yambu (mangaka)': 'Ruvuma',
  // Lindi
  'lindi': 'Lindi', 'lindi-mtama': 'Lindi', 'liwale': 'Lindi',
  'kilwa masoko': 'Lindi', 'ruangwa': 'Lindi', 'nachingwea': 'Lindi',
  // Mtwara
  'mtwara': 'Mtwara', 'm twara': 'Mtwara',
  'masasi': 'Mtwara', 'm asasi': 'Mtwara',
  'newala': 'Mtwara', 'n ewala': 'Mtwara',
  'nanyumbu (mangaka)': 'Mtwara', 'n anyumbu (mangaka)': 'Mtwara',
  'tandahimba': 'Mtwara', 't andahimba': 'Mtwara',
  'nagulo': 'Mtwara',
  // Chunya (Mbeya Rural / Songwe border area)
  'chunya (lupa tingatinga)': 'Songwe', 'chunya (makongolosi)': 'Songwe',
}

export function districtToRegion(districtKey: string): string {
  const k = districtKey.toLowerCase().trim()
  if (DISTRICT_REGION[k]) return DISTRICT_REGION[k]
  // try collapsing single-letter space artifact: "k ilosa" → "kilosa"
  const collapsed = k.replace(/\b([a-z]) ([a-z])/g, '$1$2').replace(/\b([a-z]) ([a-z])/g, '$1$2')
  return DISTRICT_REGION[collapsed] ?? 'Other'
}
