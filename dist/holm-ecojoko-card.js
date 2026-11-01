/* holm-ecojoko-card — https://github.com/kaaribou/holm-ecojoko-card — licence MIT — v1.4.0 */
// holm-ecojoko-card — cadran façon Ecojoko, adapté au thème (aucun helper)
// type: custom:holm-ecojoko-card
// power: sensor.ecojoko_consommation_temps_reel      (W, temps réel)
// energy_hc: sensor.ecojoko_consommation_hc_reseau    (kWh, total_increasing)
// energy_hp: sensor.ecojoko_consommation_hp_reseau
// energy_counter: auto | daily | total
// hc_display: text | color | both | none  (indicateur heures creuses / pleines), hc_source: binary_sensor.heures_creuses (auto si absent)   (compteurs remis à zéro chaque jour, ou index cumulés type Linky)
// price_hc: input_number.hc_heures_creuses            (€/kWh)  — ou nombre
// price_hp: input_number.heures_pleines
// tariff: hchp | tempo   — Tempo : energy_bleu_hc … energy_rouge_hp, price_bleu_hc … price_rouge_hp,
//          tempo_color / tempo_color_tomorrow (auto : intégration RTE Tempo, HOLM HP/HC…)
// solar_power: sensor.ecu_current_power               (optionnel)
// solar_energy: sensor.ecu_today_energy               (optionnel)
// export_energy: sensor.ecojoko_surplus_de_production (optionnel)
// max_power: 12000   scale: [0,50,100,500,1000,5000,10000]
// rotate_seconds: 10 (0 = pas de défilement auto)
(() => {
const NS = "http://www.w3.org/2000/svg";
// ---- traductions (fr, en, de, es, it, nl, pt, pl) ----
const I18N = {
  fr: { bleu: "Bleu", blanc: "Blanc", rouge: "Rouge", hc: "HC", hp: "HP", hc_long: "Heures creuses", hp_long: "Heures pleines", day_col: "Jour {c}", watts: "watts",
    prod_rt: "Production<br>temps réel", forecast_day: "Prévision du jour {x} kWh", kwh_produced: "{x} kWh produits", cons: "Conso {x}", resale: "Revente {x}", today: "Aujourd'hui", over7: "Sur 7 jours",
    selfcons: "Autoconsommation", kwh_consumed: "{x} kWh consommés", kwh_sold: "{x} kWh revendus", power_rt: "Puissance<br>temps réel", w_produced: "☀ {x} W produits", tomorrow: "Demain : {c}",
    solar_prod: "Production<br>solaire", kwh_today: "{x} kWh aujourd'hui", selfcons_pct: "Autoconsommation {x} %", error: "Erreur",
    l_title: "Titre", l_title_position: "Position du titre", l_mode: "Type de cadran", l_power: "Puissance temps réel (W)", l_energy_hc: "Énergie HC (kWh)", l_energy_hp: "Énergie HP (kWh)",
    l_energy_counter: "Type de compteur d'énergie", l_price_hc: "Prix HC (€/kWh)", l_price_hp: "Prix HP (€/kWh)", l_solar_power: "Puissance solaire (W)", l_solar_energy: "Production solaire du jour (kWh)",
    l_energy: "Production du jour (kWh)", l_export_energy: "Énergie revendue du jour (kWh)", l_price_self: "Valeur du kWh autoconsommé (€/kWh)", l_price_export: "Prix de rachat (€/kWh)", l_forecast: "Prévision de production du jour (kWh)",
    l_max_power: "Puissance maximale (W)", l_scale: "Graduations (W, séparées par des virgules)", l_rotate_seconds: "Défilement automatique (secondes, 0 = désactivé)", l_size: "Diamètre maximum (px, 0 = auto)", l_show_frame: "Afficher le cadre de la carte",
    l_hc_display: "Indicateur heures creuses / pleines", l_hc_pages: "Fond coloré sur", l_hc_source: "Source (automatique si vide : HOLM HP/HC ou compteurs HC / HP)", l_hc_values: "Valeurs signifiant « heures creuses »", l_tariff: "Option tarifaire",
    l_energy_tempo: "Énergie {c} {p} (kWh)", l_price_tempo: "Prix {c} {p} (€/kWh)", l_tempo_color: "Couleur du jour (automatique si vide : RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Couleur de demain (automatique si vide)",
    l_c_tempo: "Couleur — jour {c}", l_c_hc: "Couleur — heures creuses", l_c_hp: "Couleur — heures pleines", l_c_power: "Couleur — temps réel", l_c_today: "Couleur — aujourd'hui", l_c_week: "Couleur — 7 jours", l_c_solar: "Couleur — solaire", l_c_self: "Couleur — autoconsommation",
    l_language: "Langue", auto: "Automatique (profil)",
    o_hchp: "Heures creuses / heures pleines", o_tempo: "Tempo (EDF)", o_top: "En haut", o_bottom: "En bas", o_conso: "Consommation", o_solar: "Production solaire",
    o_auto: "Automatique", o_daily: "Remis à zéro chaque jour (Ecojoko…)", o_total: "Index cumulé (Linky, ZLinky…)",
    o_text: "Texte « Heures creuses / pleines » (ou « Jour Bleu · HC ») sur le cadran", o_color: "Fond du disque vert / orange (ou couleur Tempo)", o_both: "Texte et fond", o_none: "Aucun", o_pg_power: "La page puissance", o_pg_all: "Toutes les pages",
    s_entities: "Entités", s_hc: "Heures creuses / pleines et Tempo", s_dial: "Cadran et affichage", s_colors: "Couleurs",
    card_name: "HOLM – Cadran Ecojoko", card_desc: "Cadran consommation / production solaire façon Ecojoko, adapté au thème" },
  en: { bleu: "Blue", blanc: "White", rouge: "Red", hc: "Off-peak", hp: "Peak", hc_long: "Off-peak hours", hp_long: "Peak hours", day_col: "{c} day", watts: "watts",
    prod_rt: "Real-time<br>production", forecast_day: "Today's forecast {x} kWh", kwh_produced: "{x} kWh produced", cons: "Used {x}", resale: "Exported {x}", today: "Today", over7: "Last 7 days",
    selfcons: "Self-consumption", kwh_consumed: "{x} kWh used", kwh_sold: "{x} kWh exported", power_rt: "Real-time<br>power", w_produced: "☀ {x} W produced", tomorrow: "Tomorrow: {c}",
    solar_prod: "Solar<br>production", kwh_today: "{x} kWh today", selfcons_pct: "Self-consumption {x}%", error: "Error",
    l_title: "Title", l_title_position: "Title position", l_mode: "Dial type", l_power: "Real-time power (W)", l_energy_hc: "Off-peak energy (kWh)", l_energy_hp: "Peak energy (kWh)",
    l_energy_counter: "Energy counter type", l_price_hc: "Off-peak price (€/kWh)", l_price_hp: "Peak price (€/kWh)", l_solar_power: "Solar power (W)", l_solar_energy: "Today's solar production (kWh)",
    l_energy: "Today's production (kWh)", l_export_energy: "Today's exported energy (kWh)", l_price_self: "Value of a self-consumed kWh (€/kWh)", l_price_export: "Feed-in price (€/kWh)", l_forecast: "Today's production forecast (kWh)",
    l_max_power: "Maximum power (W)", l_scale: "Scale marks (W, comma-separated)", l_rotate_seconds: "Auto-rotation (seconds, 0 = off)", l_size: "Maximum diameter (px, 0 = auto)", l_show_frame: "Show the card frame",
    l_hc_display: "Off-peak / peak indicator", l_hc_pages: "Coloured background on", l_hc_source: "Source (automatic if empty: HOLM HP/HC or off-peak / peak counters)", l_hc_values: "Values meaning “off-peak”", l_tariff: "Tariff",
    l_energy_tempo: "{c} {p} energy (kWh)", l_price_tempo: "{c} {p} price (€/kWh)", l_tempo_color: "Today's colour (automatic if empty: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Tomorrow's colour (automatic if empty)",
    l_c_tempo: "Colour — {c} day", l_c_hc: "Colour — off-peak hours", l_c_hp: "Colour — peak hours", l_c_power: "Colour — real time", l_c_today: "Colour — today", l_c_week: "Colour — 7 days", l_c_solar: "Colour — solar", l_c_self: "Colour — self-consumption",
    l_language: "Language", auto: "Automatic (profile)",
    o_hchp: "Off-peak / peak hours", o_tempo: "Tempo (EDF)", o_top: "Top", o_bottom: "Bottom", o_conso: "Consumption", o_solar: "Solar production",
    o_auto: "Automatic", o_daily: "Reset every day (Ecojoko…)", o_total: "Cumulative index (Linky, ZLinky…)",
    o_text: "“Off-peak / Peak hours” text (or “Blue day · Off-peak”) on the dial", o_color: "Green / orange disc background (or Tempo colour)", o_both: "Text and background", o_none: "None", o_pg_power: "The power page", o_pg_all: "All pages",
    s_entities: "Entities", s_hc: "Off-peak / peak hours and Tempo", s_dial: "Dial and display", s_colors: "Colours",
    card_name: "HOLM – Ecojoko dial", card_desc: "Ecojoko-style consumption / solar production dial, matching your theme" },
  de: { bleu: "Blau", blanc: "Weiß", rouge: "Rot", hc: "NT", hp: "HT", hc_long: "Niedertarif", hp_long: "Hochtarif", day_col: "{c}er Tag", watts: "Watt",
    prod_rt: "Erzeugung<br>in Echtzeit", forecast_day: "Prognose heute {x} kWh", kwh_produced: "{x} kWh erzeugt", cons: "Verbr. {x}", resale: "Einsp. {x}", today: "Heute", over7: "Letzte 7 Tage",
    selfcons: "Eigenverbrauch", kwh_consumed: "{x} kWh verbraucht", kwh_sold: "{x} kWh eingespeist", power_rt: "Leistung<br>in Echtzeit", w_produced: "☀ {x} W erzeugt", tomorrow: "Morgen: {c}",
    solar_prod: "Solar-<br>erzeugung", kwh_today: "{x} kWh heute", selfcons_pct: "Eigenverbrauch {x} %", error: "Fehler",
    l_title: "Titel", l_title_position: "Titelposition", l_mode: "Art der Anzeige", l_power: "Echtzeitleistung (W)", l_energy_hc: "Energie NT (kWh)", l_energy_hp: "Energie HT (kWh)",
    l_energy_counter: "Art des Energiezählers", l_price_hc: "Preis NT (€/kWh)", l_price_hp: "Preis HT (€/kWh)", l_solar_power: "Solarleistung (W)", l_solar_energy: "Heutige Solarerzeugung (kWh)",
    l_energy: "Heutige Erzeugung (kWh)", l_export_energy: "Heute eingespeiste Energie (kWh)", l_price_self: "Wert einer selbst verbrauchten kWh (€/kWh)", l_price_export: "Einspeisevergütung (€/kWh)", l_forecast: "Heutige Erzeugungsprognose (kWh)",
    l_max_power: "Maximale Leistung (W)", l_scale: "Skalenstriche (W, durch Kommas getrennt)", l_rotate_seconds: "Automatischer Wechsel (Sekunden, 0 = aus)", l_size: "Maximaler Durchmesser (px, 0 = automatisch)", l_show_frame: "Kartenrahmen anzeigen",
    l_hc_display: "Anzeige Niedertarif / Hochtarif", l_hc_pages: "Farbiger Hintergrund auf", l_hc_source: "Quelle (automatisch wenn leer: HOLM HP/HC oder NT/HT-Zähler)", l_hc_values: "Werte für „Niedertarif“", l_tariff: "Tarif",
    l_energy_tempo: "Energie {c} {p} (kWh)", l_price_tempo: "Preis {c} {p} (€/kWh)", l_tempo_color: "Farbe von heute (automatisch wenn leer: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Farbe von morgen (automatisch wenn leer)",
    l_c_tempo: "Farbe — {c}er Tag", l_c_hc: "Farbe — Niedertarif", l_c_hp: "Farbe — Hochtarif", l_c_power: "Farbe — Echtzeit", l_c_today: "Farbe — heute", l_c_week: "Farbe — 7 Tage", l_c_solar: "Farbe — Solar", l_c_self: "Farbe — Eigenverbrauch",
    l_language: "Sprache", auto: "Automatisch (Profil)",
    o_hchp: "Niedertarif / Hochtarif", o_tempo: "Tempo (EDF)", o_top: "Oben", o_bottom: "Unten", o_conso: "Verbrauch", o_solar: "Solarerzeugung",
    o_auto: "Automatisch", o_daily: "Täglich zurückgesetzt (Ecojoko…)", o_total: "Kumulierter Zählerstand (Linky, ZLinky…)",
    o_text: "Text „Niedertarif / Hochtarif“ (oder „Blauer Tag · NT“) auf der Anzeige", o_color: "Grüner / oranger Hintergrund (oder Tempo-Farbe)", o_both: "Text und Hintergrund", o_none: "Keine", o_pg_power: "Die Leistungsseite", o_pg_all: "Alle Seiten",
    s_entities: "Entitäten", s_hc: "Niedertarif / Hochtarif und Tempo", s_dial: "Anzeige und Darstellung", s_colors: "Farben",
    card_name: "HOLM – Ecojoko-Anzeige", card_desc: "Verbrauchs- / Solaranzeige im Ecojoko-Stil, passend zum Theme" },
  es: { bleu: "Azul", blanc: "Blanco", rouge: "Rojo", hc: "Valle", hp: "Punta", hc_long: "Horas valle", hp_long: "Horas punta", day_col: "Día {c}", watts: "vatios",
    prod_rt: "Producción<br>en tiempo real", forecast_day: "Previsión del día {x} kWh", kwh_produced: "{x} kWh producidos", cons: "Consumo {x}", resale: "Venta {x}", today: "Hoy", over7: "Últimos 7 días",
    selfcons: "Autoconsumo", kwh_consumed: "{x} kWh consumidos", kwh_sold: "{x} kWh vendidos", power_rt: "Potencia<br>en tiempo real", w_produced: "☀ {x} W producidos", tomorrow: "Mañana: {c}",
    solar_prod: "Producción<br>solar", kwh_today: "{x} kWh hoy", selfcons_pct: "Autoconsumo {x} %", error: "Error",
    l_title: "Título", l_title_position: "Posición del título", l_mode: "Tipo de esfera", l_power: "Potencia en tiempo real (W)", l_energy_hc: "Energía valle (kWh)", l_energy_hp: "Energía punta (kWh)",
    l_energy_counter: "Tipo de contador de energía", l_price_hc: "Precio valle (€/kWh)", l_price_hp: "Precio punta (€/kWh)", l_solar_power: "Potencia solar (W)", l_solar_energy: "Producción solar del día (kWh)",
    l_energy: "Producción del día (kWh)", l_export_energy: "Energía vendida del día (kWh)", l_price_self: "Valor del kWh autoconsumido (€/kWh)", l_price_export: "Precio de compensación (€/kWh)", l_forecast: "Previsión de producción del día (kWh)",
    l_max_power: "Potencia máxima (W)", l_scale: "Graduaciones (W, separadas por comas)", l_rotate_seconds: "Rotación automática (segundos, 0 = desactivada)", l_size: "Diámetro máximo (px, 0 = auto)", l_show_frame: "Mostrar el marco de la tarjeta",
    l_hc_display: "Indicador horas valle / punta", l_hc_pages: "Fondo coloreado en", l_hc_source: "Fuente (automática si está vacía: HOLM HP/HC o contadores valle / punta)", l_hc_values: "Valores que significan «horas valle»", l_tariff: "Tarifa",
    l_energy_tempo: "Energía {c} {p} (kWh)", l_price_tempo: "Precio {c} {p} (€/kWh)", l_tempo_color: "Color del día (automático si está vacío: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Color de mañana (automático si está vacío)",
    l_c_tempo: "Color — día {c}", l_c_hc: "Color — horas valle", l_c_hp: "Color — horas punta", l_c_power: "Color — tiempo real", l_c_today: "Color — hoy", l_c_week: "Color — 7 días", l_c_solar: "Color — solar", l_c_self: "Color — autoconsumo",
    l_language: "Idioma", auto: "Automático (perfil)",
    o_hchp: "Horas valle / horas punta", o_tempo: "Tempo (EDF)", o_top: "Arriba", o_bottom: "Abajo", o_conso: "Consumo", o_solar: "Producción solar",
    o_auto: "Automático", o_daily: "Se reinicia cada día (Ecojoko…)", o_total: "Índice acumulado (Linky, ZLinky…)",
    o_text: "Texto «Horas valle / punta» (o «Día Azul · Valle») en la esfera", o_color: "Fondo del disco verde / naranja (o color Tempo)", o_both: "Texto y fondo", o_none: "Ninguno", o_pg_power: "La página de potencia", o_pg_all: "Todas las páginas",
    s_entities: "Entidades", s_hc: "Horas valle / punta y Tempo", s_dial: "Esfera y visualización", s_colors: "Colores",
    card_name: "HOLM – Esfera Ecojoko", card_desc: "Esfera de consumo / producción solar estilo Ecojoko, adaptada al tema" },
  it: { bleu: "Blu", blanc: "Bianco", rouge: "Rosso", hc: "F. punta", hp: "Punta", hc_long: "Fuori punta", hp_long: "Ore di punta", day_col: "Giorno {c}", watts: "watt",
    prod_rt: "Produzione<br>in tempo reale", forecast_day: "Previsione di oggi {x} kWh", kwh_produced: "{x} kWh prodotti", cons: "Consumo {x}", resale: "Immessi {x}", today: "Oggi", over7: "Ultimi 7 giorni",
    selfcons: "Autoconsumo", kwh_consumed: "{x} kWh consumati", kwh_sold: "{x} kWh immessi", power_rt: "Potenza<br>in tempo reale", w_produced: "☀ {x} W prodotti", tomorrow: "Domani: {c}",
    solar_prod: "Produzione<br>solare", kwh_today: "{x} kWh oggi", selfcons_pct: "Autoconsumo {x}%", error: "Errore",
    l_title: "Titolo", l_title_position: "Posizione del titolo", l_mode: "Tipo di quadrante", l_power: "Potenza in tempo reale (W)", l_energy_hc: "Energia fuori punta (kWh)", l_energy_hp: "Energia di punta (kWh)",
    l_energy_counter: "Tipo di contatore di energia", l_price_hc: "Prezzo fuori punta (€/kWh)", l_price_hp: "Prezzo di punta (€/kWh)", l_solar_power: "Potenza solare (W)", l_solar_energy: "Produzione solare di oggi (kWh)",
    l_energy: "Produzione di oggi (kWh)", l_export_energy: "Energia immessa oggi (kWh)", l_price_self: "Valore del kWh autoconsumato (€/kWh)", l_price_export: "Prezzo di ritiro (€/kWh)", l_forecast: "Previsione di produzione di oggi (kWh)",
    l_max_power: "Potenza massima (W)", l_scale: "Tacche (W, separate da virgole)", l_rotate_seconds: "Scorrimento automatico (secondi, 0 = disattivato)", l_size: "Diametro massimo (px, 0 = automatico)", l_show_frame: "Mostra la cornice della scheda",
    l_hc_display: "Indicatore fuori punta / punta", l_hc_pages: "Sfondo colorato su", l_hc_source: "Fonte (automatica se vuota: HOLM HP/HC o contatori a fasce)", l_hc_values: "Valori che indicano «fuori punta»", l_tariff: "Tariffa",
    l_energy_tempo: "Energia {c} {p} (kWh)", l_price_tempo: "Prezzo {c} {p} (€/kWh)", l_tempo_color: "Colore di oggi (automatico se vuoto: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Colore di domani (automatico se vuoto)",
    l_c_tempo: "Colore — giorno {c}", l_c_hc: "Colore — fuori punta", l_c_hp: "Colore — ore di punta", l_c_power: "Colore — tempo reale", l_c_today: "Colore — oggi", l_c_week: "Colore — 7 giorni", l_c_solar: "Colore — solare", l_c_self: "Colore — autoconsumo",
    l_language: "Lingua", auto: "Automatica (profilo)",
    o_hchp: "Fuori punta / ore di punta", o_tempo: "Tempo (EDF)", o_top: "In alto", o_bottom: "In basso", o_conso: "Consumo", o_solar: "Produzione solare",
    o_auto: "Automatico", o_daily: "Azzerato ogni giorno (Ecojoko…)", o_total: "Indice cumulato (Linky, ZLinky…)",
    o_text: "Testo «Fuori punta / Ore di punta» (o «Giorno Blu · F. punta») sul quadrante", o_color: "Sfondo del disco verde / arancione (o colore Tempo)", o_both: "Testo e sfondo", o_none: "Nessuno", o_pg_power: "La pagina potenza", o_pg_all: "Tutte le pagine",
    s_entities: "Entità", s_hc: "Fuori punta / punta e Tempo", s_dial: "Quadrante e visualizzazione", s_colors: "Colori",
    card_name: "HOLM – Quadrante Ecojoko", card_desc: "Quadrante consumo / produzione solare in stile Ecojoko, adattato al tema" },
  nl: { bleu: "Blauw", blanc: "Wit", rouge: "Rood", hc: "Dal", hp: "Piek", hc_long: "Daltarief", hp_long: "Piektarief", day_col: "Dag {c}", watts: "watt",
    prod_rt: "Opwekking<br>realtime", forecast_day: "Verwachting vandaag {x} kWh", kwh_produced: "{x} kWh opgewekt", cons: "Verbr. {x}", resale: "Terug {x}", today: "Vandaag", over7: "Laatste 7 dagen",
    selfcons: "Eigen verbruik", kwh_consumed: "{x} kWh verbruikt", kwh_sold: "{x} kWh teruggeleverd", power_rt: "Vermogen<br>realtime", w_produced: "☀ {x} W opgewekt", tomorrow: "Morgen: {c}",
    solar_prod: "Zonne-<br>opwekking", kwh_today: "{x} kWh vandaag", selfcons_pct: "Eigen verbruik {x}%", error: "Fout",
    l_title: "Titel", l_title_position: "Positie van de titel", l_mode: "Type meter", l_power: "Realtime vermogen (W)", l_energy_hc: "Energie dal (kWh)", l_energy_hp: "Energie piek (kWh)",
    l_energy_counter: "Type energiemeter", l_price_hc: "Prijs dal (€/kWh)", l_price_hp: "Prijs piek (€/kWh)", l_solar_power: "Zonnevermogen (W)", l_solar_energy: "Zonne-opwekking vandaag (kWh)",
    l_energy: "Opwekking vandaag (kWh)", l_export_energy: "Vandaag teruggeleverde energie (kWh)", l_price_self: "Waarde van een zelf verbruikte kWh (€/kWh)", l_price_export: "Terugleververgoeding (€/kWh)", l_forecast: "Verwachte opwekking vandaag (kWh)",
    l_max_power: "Maximaal vermogen (W)", l_scale: "Schaalverdeling (W, gescheiden door komma's)", l_rotate_seconds: "Automatisch wisselen (seconden, 0 = uit)", l_size: "Maximale diameter (px, 0 = automatisch)", l_show_frame: "Kaartkader tonen",
    l_hc_display: "Indicator dal / piek", l_hc_pages: "Gekleurde achtergrond op", l_hc_source: "Bron (automatisch indien leeg: HOLM HP/HC of dal/piek-meters)", l_hc_values: "Waarden die ‘daltarief’ betekenen", l_tariff: "Tarief",
    l_energy_tempo: "Energie {c} {p} (kWh)", l_price_tempo: "Prijs {c} {p} (€/kWh)", l_tempo_color: "Kleur van vandaag (automatisch indien leeg: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Kleur van morgen (automatisch indien leeg)",
    l_c_tempo: "Kleur — dag {c}", l_c_hc: "Kleur — daltarief", l_c_hp: "Kleur — piektarief", l_c_power: "Kleur — realtime", l_c_today: "Kleur — vandaag", l_c_week: "Kleur — 7 dagen", l_c_solar: "Kleur — zon", l_c_self: "Kleur — eigen verbruik",
    l_language: "Taal", auto: "Automatisch (profiel)",
    o_hchp: "Dal- / piekuren", o_tempo: "Tempo (EDF)", o_top: "Boven", o_bottom: "Onder", o_conso: "Verbruik", o_solar: "Zonne-opwekking",
    o_auto: "Automatisch", o_daily: "Elke dag op nul gezet (Ecojoko…)", o_total: "Cumulatieve meterstand (Linky, ZLinky…)",
    o_text: "Tekst ‘Daltarief / Piektarief’ (of ‘Blauwe dag · Dal’) op de meter", o_color: "Groene / oranje achtergrond (of Tempo-kleur)", o_both: "Tekst en achtergrond", o_none: "Geen", o_pg_power: "De vermogenspagina", o_pg_all: "Alle pagina's",
    s_entities: "Entiteiten", s_hc: "Dal- / piekuren en Tempo", s_dial: "Meter en weergave", s_colors: "Kleuren",
    card_name: "HOLM – Ecojoko-meter", card_desc: "Verbruiks- / zonne-opwekkingsmeter in Ecojoko-stijl, passend bij je thema" },
  pt: { bleu: "Azul", blanc: "Branco", rouge: "Vermelho", hc: "Vazio", hp: "Cheias", hc_long: "Horas de vazio", hp_long: "Horas cheias", day_col: "Dia {c}", watts: "watts",
    prod_rt: "Produção<br>em tempo real", forecast_day: "Previsão do dia {x} kWh", kwh_produced: "{x} kWh produzidos", cons: "Consumo {x}", resale: "Venda {x}", today: "Hoje", over7: "Últimos 7 dias",
    selfcons: "Autoconsumo", kwh_consumed: "{x} kWh consumidos", kwh_sold: "{x} kWh vendidos", power_rt: "Potência<br>em tempo real", w_produced: "☀ {x} W produzidos", tomorrow: "Amanhã: {c}",
    solar_prod: "Produção<br>solar", kwh_today: "{x} kWh hoje", selfcons_pct: "Autoconsumo {x}%", error: "Erro",
    l_title: "Título", l_title_position: "Posição do título", l_mode: "Tipo de mostrador", l_power: "Potência em tempo real (W)", l_energy_hc: "Energia de vazio (kWh)", l_energy_hp: "Energia de cheias (kWh)",
    l_energy_counter: "Tipo de contador de energia", l_price_hc: "Preço de vazio (€/kWh)", l_price_hp: "Preço de cheias (€/kWh)", l_solar_power: "Potência solar (W)", l_solar_energy: "Produção solar do dia (kWh)",
    l_energy: "Produção do dia (kWh)", l_export_energy: "Energia vendida do dia (kWh)", l_price_self: "Valor do kWh autoconsumido (€/kWh)", l_price_export: "Preço de venda (€/kWh)", l_forecast: "Previsão de produção do dia (kWh)",
    l_max_power: "Potência máxima (W)", l_scale: "Graduações (W, separadas por vírgulas)", l_rotate_seconds: "Rotação automática (segundos, 0 = desativada)", l_size: "Diâmetro máximo (px, 0 = auto)", l_show_frame: "Mostrar a moldura do cartão",
    l_hc_display: "Indicador vazio / cheias", l_hc_pages: "Fundo colorido em", l_hc_source: "Fonte (automática se vazia: HOLM HP/HC ou contadores vazio / cheias)", l_hc_values: "Valores que significam «vazio»", l_tariff: "Tarifa",
    l_energy_tempo: "Energia {c} {p} (kWh)", l_price_tempo: "Preço {c} {p} (€/kWh)", l_tempo_color: "Cor do dia (automática se vazia: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Cor de amanhã (automática se vazia)",
    l_c_tempo: "Cor — dia {c}", l_c_hc: "Cor — horas de vazio", l_c_hp: "Cor — horas cheias", l_c_power: "Cor — tempo real", l_c_today: "Cor — hoje", l_c_week: "Cor — 7 dias", l_c_solar: "Cor — solar", l_c_self: "Cor — autoconsumo",
    l_language: "Idioma", auto: "Automático (perfil)",
    o_hchp: "Horas de vazio / cheias", o_tempo: "Tempo (EDF)", o_top: "Em cima", o_bottom: "Em baixo", o_conso: "Consumo", o_solar: "Produção solar",
    o_auto: "Automático", o_daily: "Reposto a zero todos os dias (Ecojoko…)", o_total: "Índice acumulado (Linky, ZLinky…)",
    o_text: "Texto «Horas de vazio / cheias» (ou «Dia Azul · Vazio») no mostrador", o_color: "Fundo do disco verde / laranja (ou cor Tempo)", o_both: "Texto e fundo", o_none: "Nenhum", o_pg_power: "A página de potência", o_pg_all: "Todas as páginas",
    s_entities: "Entidades", s_hc: "Horas de vazio / cheias e Tempo", s_dial: "Mostrador e apresentação", s_colors: "Cores",
    card_name: "HOLM – Mostrador Ecojoko", card_desc: "Mostrador de consumo / produção solar ao estilo Ecojoko, adaptado ao tema" },
  pl: { bleu: "Niebieski", blanc: "Biały", rouge: "Czerwony", hc: "Poza szczytem", hp: "Szczyt", hc_long: "Strefa pozaszczytowa", hp_long: "Strefa szczytowa", day_col: "Dzień {c}", watts: "waty",
    prod_rt: "Produkcja<br>na żywo", forecast_day: "Prognoza na dziś {x} kWh", kwh_produced: "{x} kWh wyprodukowano", cons: "Zużycie {x}", resale: "Oddano {x}", today: "Dziś", over7: "Ostatnie 7 dni",
    selfcons: "Autokonsumpcja", kwh_consumed: "{x} kWh zużyto", kwh_sold: "{x} kWh oddano", power_rt: "Moc<br>na żywo", w_produced: "☀ {x} W produkcji", tomorrow: "Jutro: {c}",
    solar_prod: "Produkcja<br>PV", kwh_today: "{x} kWh dziś", selfcons_pct: "Autokonsumpcja {x}%", error: "Błąd",
    l_title: "Tytuł", l_title_position: "Położenie tytułu", l_mode: "Rodzaj tarczy", l_power: "Moc na żywo (W)", l_energy_hc: "Energia poza szczytem (kWh)", l_energy_hp: "Energia w szczycie (kWh)",
    l_energy_counter: "Rodzaj licznika energii", l_price_hc: "Cena poza szczytem (€/kWh)", l_price_hp: "Cena w szczycie (€/kWh)", l_solar_power: "Moc PV (W)", l_solar_energy: "Dzisiejsza produkcja PV (kWh)",
    l_energy: "Dzisiejsza produkcja (kWh)", l_export_energy: "Energia oddana dziś (kWh)", l_price_self: "Wartość zużytej na miejscu kWh (€/kWh)", l_price_export: "Cena odkupu (€/kWh)", l_forecast: "Prognoza produkcji na dziś (kWh)",
    l_max_power: "Moc maksymalna (W)", l_scale: "Podziałka (W, oddzielona przecinkami)", l_rotate_seconds: "Automatyczne przewijanie (sekundy, 0 = wył.)", l_size: "Maksymalna średnica (px, 0 = auto)", l_show_frame: "Pokaż ramkę karty",
    l_hc_display: "Wskaźnik strefy pozaszczytowej / szczytowej", l_hc_pages: "Kolorowe tło na", l_hc_source: "Źródło (automatycznie, jeśli puste: HOLM HP/HC lub liczniki stref)", l_hc_values: "Wartości oznaczające „poza szczytem”", l_tariff: "Taryfa",
    l_energy_tempo: "Energia {c} {p} (kWh)", l_price_tempo: "Cena {c} {p} (€/kWh)", l_tempo_color: "Kolor dnia (automatycznie, jeśli puste: RTE Tempo, HOLM HP/HC…)", l_tempo_color_tomorrow: "Kolor jutra (automatycznie, jeśli puste)",
    l_c_tempo: "Kolor — dzień {c}", l_c_hc: "Kolor — poza szczytem", l_c_hp: "Kolor — szczyt", l_c_power: "Kolor — na żywo", l_c_today: "Kolor — dziś", l_c_week: "Kolor — 7 dni", l_c_solar: "Kolor — PV", l_c_self: "Kolor — autokonsumpcja",
    l_language: "Język", auto: "Automatycznie (profil)",
    o_hchp: "Strefa pozaszczytowa / szczytowa", o_tempo: "Tempo (EDF)", o_top: "Na górze", o_bottom: "Na dole", o_conso: "Zużycie", o_solar: "Produkcja PV",
    o_auto: "Automatycznie", o_daily: "Zerowany codziennie (Ecojoko…)", o_total: "Narastający stan licznika (Linky, ZLinky…)",
    o_text: "Tekst „Poza szczytem / Szczyt” (lub „Dzień niebieski · Poza szczytem”) na tarczy", o_color: "Zielone / pomarańczowe tło (lub kolor Tempo)", o_both: "Tekst i tło", o_none: "Brak", o_pg_power: "Strona mocy", o_pg_all: "Wszystkie strony",
    s_entities: "Encje", s_hc: "Strefy taryfowe i Tempo", s_dial: "Tarcza i wyświetlanie", s_colors: "Kolory",
    card_name: "HOLM – Tarcza Ecojoko", card_desc: "Tarcza zużycia / produkcji PV w stylu Ecojoko, dopasowana do motywu" },
};
const LANG_NAMES = { fr: "Français", en: "English", de: "Deutsch", es: "Español", it: "Italiano", nl: "Nederlands", pt: "Português", pl: "Polski" };
const LOCALES = { fr: "fr-FR", en: "en-GB", de: "de-DE", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT", pl: "pl-PL" };
// langue : option `language` de la carte, sinon celle du profil Home Assistant ; anglais si non traduite
const langOf = (hass, c) => { const l = String((c && c.language) || hass?.locale?.language || hass?.language || navigator.language || "en").toLowerCase().split(/[-_]/)[0]; return I18N[l] ? l : "en"; };
const tr = (l, k, v) => { let s = (I18N[l] && I18N[l][k]) ?? I18N.en[k] ?? I18N.fr[k] ?? k; if (v) for (const [a, b] of Object.entries(v)) s = s.replace("{" + a + "}", b); return s; };
let NUMLOC = "fr-FR";
const setLoc = (hass, c) => { const l = langOf(hass, c); const p = hass?.locale?.language; NUMLOC = !(c && c.language) && p && p.toLowerCase().startsWith(l) ? p : LOCALES[l]; return l; };
const fmtNum = (v, d = 0) => Number(v).toLocaleString(NUMLOC, { minimumFractionDigits: d, maximumFractionDigits: d });
const TEMPO = ["bleu", "blanc", "rouge"];
// couleur Tempo depuis une valeur d'entité (Bleu, BLUE, TEMPO_ROUGE, HCJB, 1/2/3…)
const tempoOf = (v) => {
  const x = String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  if (!x || x === "unknown" || x === "unavailable" || x === "inconnu" || x === "non defini") return null;
  if (/bleu|blue|jb$|^1$/.test(x)) return "bleu";
  if (/blanc|white|jw$|^2$/.test(x)) return "blanc";
  if (/rouge|red|jr$|^3$/.test(x)) return "rouge";
  return null;
};
const fmtK = (v) => (v >= 1000 ? (v / 1000).toLocaleString(NUMLOC, { maximumFractionDigits: 1 }) + "K" : String(v));

class HolmEcojokoCard extends HTMLElement {
  setConfig(c) {
    if (!c || !c.power) throw new Error("holm-ecojoko-card : 'power' est requis");
    this._c = {
      max_power: 12000, rotate_seconds: 10,
      colors: { power: "#1f6aa8", today: "#0a8f95", week: "#43a867", solar: "#d99a1c" }, ...c,
    };
    this._c.colors = { power: "#1f6aa8", today: "#0a8f95", week: "#43a867", solar: "#d99a1c", hc: "#2e9e5b", hp: "#e2702a", bleu: "#2f6fd6", blanc: "#8d99a8", rouge: "#d8433b", ...(c.colors || {}) };
    this._tempo = c.tariff === "tempo" && c.mode !== "solar";
    this._c.hc_display = ["text", "color", "both", "none"].includes(c.hc_display) ? c.hc_display : "text";
    this._c.hc_pages = c.hc_pages === "all" ? "all" : "power";
    this._c.hc_values = String(c.hc_values || "on, HC, HC.., heures creuses").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (typeof this._c.scale === "string") this._c.scale = this._c.scale.split(/[;, ]+/).map(Number).filter((n) => !isNaN(n));
    if (!Array.isArray(this._c.scale) || this._c.scale.length < 2) delete this._c.scale;
    this._c.max_power = Number(this._c.max_power) || 12000;
    this._c.rotate_seconds = Number(this._c.rotate_seconds ?? 10);
    this._slide = Math.min(this._slide || 0, 3); this._spark = []; this._stats = null; this._fetched = 0; this._key = "";
    this._c.energy_counter = ["daily", "total"].includes(c.energy_counter) ? c.energy_counter : "auto";
    this._base = {}; this._todayStat = {};
    this._solar = this._c.mode === "solar";
    if (this._solar) {
      this._c.colors = { power: "#d9921c", today: "#e2702a", week: "#43a867", self: "#0a8f95", hc: "#2e9e5b", hp: "#e2702a", ...(c.colors || {}) };
      if (!this._c.scale) this._c.scale = [0, 250, 500, 1000, 2000, 3000, 4500];
      if (!c.max_power) this._c.max_power = 6000;
      this._slides = ["power", "today", "week", "self"];
    } else {
      if (!this._c.scale) this._c.scale = [0, 50, 100, 500, 1000, 5000, 10000];
      this._slides = ["power", "today", "week"];
      if (this._c.solar_power) this._slides.push("solar");
    }
    if (this.shadowRoot) this._render(true);
  }
  connectedCallback() {
    this._startTimer();
    if (this.shadowRoot && this._c) this._render(true);
  }
  disconnectedCallback() { clearInterval(this._timer); this._timer = null; this._ro?.disconnect(); this._ro = null; this._root = null; }
  _startTimer() {
    clearInterval(this._timer);
    if (this._c && this._c.rotate_seconds > 0)
      this._timer = setInterval(() => { if (!this._hover) { this._slide = (this._slide + 1) % this._slides.length; this._render(); } }, this._c.rotate_seconds * 1000);
  }
  _num(id) { if (id === undefined || id === null) return NaN; if (typeof id === "number") return id; const s = this._hass?.states[id]; return s ? parseFloat(s.state) : NaN; }
  // Énergie en kWh (un capteur en Wh ou MWh est converti)
  _kwh(id) {
    const v = this._num(id);
    if (isNaN(v) || typeof id !== "string") return v;
    const u = String(this._hass?.states[id]?.attributes?.unit_of_measurement || "").toLowerCase();
    return u === "wh" ? v / 1000 : u === "mwh" ? v * 1000 : v;
  }
  // Énergie du jour : compteur remis à zéro chaque jour, ou index cumulé (valeur actuelle − valeur à minuit, d'après les statistiques)
  _day(id) {
    const raw = this._kwh(id);
    if (isNaN(raw) || !id) return raw;
    const mode = this._c.energy_counter, base = this._base[id], ts = this._todayStat[id];
    if (mode === "daily") return raw;
    const total = base !== undefined ? Math.max(0, raw - base) : ts !== undefined ? ts : NaN;
    if (mode === "total") return total;
    if (base !== undefined) return raw >= base - 0.001 && Math.abs(raw - base - (ts || 0)) <= Math.abs(raw - (ts || 0)) ? total : raw;
    return ts !== undefined && raw > ts * 3 + 5 ? ts : raw;
  }
  // Compteurs d'énergie et leur prix : HC / HP, ou les 6 index Tempo
  _counters() {
    const c = this._c;
    if (this._tempo) {
      const out = [];
      for (const col of TEMPO) for (const per of ["hc", "hp"]) {
        const id = c[`energy_${col}_${per}`];
        if (id) out.push({ id, price: c[`price_${col}_${per}`], hc: per === "hc", col });
      }
      return out;
    }
    return [[c.energy_hc, c.price_hc, true], [c.energy_hp, c.price_hp, false]].filter(([id]) => id).map(([id, price, hc]) => ({ id, price, hc, col: null }));
  }
  // Couleur Tempo du jour (ou de demain) : entité choisie, sinon détectée (RTE Tempo, HOLM HP/HC…), sinon compteur qui avance
  _tempoEntity(tomorrow) {
    const h = this._hass; if (!h) return null;
    const key = tomorrow ? "tempo_color_tomorrow" : "tempo_color";
    if (this._c[key]) return this._c[key];
    const cache = tomorrow ? "_tAutoT" : "_tAuto";
    if (this[cache] === undefined || (this[cache] && !h.states[this[cache]])) {
      const want = tomorrow ? /(demain|tomorrow|prochain|next|j1|j_1)/ : /(aujourd|today|actuel|current|du_jour|j0)/;
      this[cache] = Object.keys(h.states).find((e) => e.startsWith("sensor.") && /tempo/.test(e) && want.test(e)
        && (tempoOf(h.states[e].state) || (h.states[e].attributes.options || []).some((o) => tempoOf(o)))) || null;
    }
    return this[cache];
  }
  _tempoColor(tomorrow) {
    const ent = this._tempoEntity(tomorrow);
    if (ent) { const col = tempoOf(this._hass.states[ent]?.state); if (col || tomorrow) return col; }
    return tomorrow ? null : this._tempoLast ?? null;
  }
  // Heures creuses ? 1) entité choisie, 2) intégration HOLM HP/HC, 3) compteur HC ou HP qui avance
  _hcEntity() {
    const h = this._hass; if (!h) return null;
    if (this._c.hc_source) return this._c.hc_source;
    if (this._hcAuto === undefined || (this._hcAuto && !h.states[this._hcAuto]))
      this._hcAuto = Object.keys(h.states).find((e) => e.startsWith("binary_sensor.") && h.states[e].attributes.plages_hc !== undefined && h.states[e].attributes.prochaine_periode !== undefined)
        || (this._tempo ? Object.keys(h.states).find((e) => e.startsWith("binary_sensor.") && /tempo/.test(e) && /heures_creuses|off_peak/.test(e)) : null) || null;
    return this._hcAuto;
  }
  _isHC() {
    const ent = this._hcEntity();
    if (ent) {
      const st = this._hass.states[ent];
      if (!st || ["unknown", "unavailable", ""].includes(st.state)) return null;
      const v = st.state.trim().toLowerCase();
      if (v === "off" || v === "false") return false;
      return this._c.hc_values.some((x) => v === x || (x.length > 2 && v.includes(x)));
    }
    if (this._solar) return null;
    if (this._hcLast !== undefined && this._hcLast !== null) return this._hcLast;
    if (this._tempo) { const hr = new Date().getHours(); return hr >= 22 || hr < 6; }   // heures creuses Tempo : 22 h – 6 h
    return null;
  }
  _trackCounters() {
    if (this._solar) return;
    const cs = this._counters(); if (cs.length < 2) return;
    for (const k of cs) {
      const v = this._num(k.id), prev = this._prev?.[k.id];
      if (!isNaN(v) && prev !== undefined && v > prev) { this._hcLast = k.hc; if (k.col) this._tempoLast = k.col; }
      (this._prev = this._prev || {})[k.id] = v;
    }
  }
  _t(k, v) { return tr(this._l || langOf(this._hass, this._c), k, v); }
  set hass(h) {
    this._hass = h; this._l = setLoc(h, this._c);
    this._trackCounters();
    if (!this.shadowRoot) { this.attachShadow({ mode: "open" }); this._render(true); this._startTimer(); }
    const c = this._c;
    const p = this._num(c.power);
    if (!isNaN(p)) {
      const t = Date.now();
      const last = this._spark[this._spark.length - 1];
      if (!last || last.v !== p || t - last.t > 60000) this._spark.push({ t, v: p });
      this._spark = this._spark.filter((x) => x.t > t - 3600000);
    }
    const dayKey = new Date().toDateString();
    if (Date.now() - this._fetched > 300000 || this._dayKey !== dayKey) { this._fetched = Date.now(); this._dayKey = dayKey; this._load(); }
    const key = [c.power, c.energy, ...this._counters().map((k) => k.id), c.solar_power, c.solar_energy, c.export_energy, c.forecast, this._hcEntity(),
      ...(this._tempo ? [this._tempoEntity(false), this._tempoEntity(true)] : [])].map((e) => e && h.states[e]?.state).join("|") + "|" + this._hcLast + "|" + this._tempoLast;
    if (key !== this._key) { this._key = key; this._render(); }
  }
  async _load() {
    const c = this._c, h = this._hass;
    try {
      const now = new Date();
      // Sparkline : 60 dernières minutes
      const r = await h.callWS({ type: "history/history_during_period", start_time: new Date(now - 3600000).toISOString(),
        end_time: now.toISOString(), entity_ids: [c.power], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const pts = (r[c.power] || []).map((x) => ({ t: (x.lc ?? x.lu) * 1000, v: parseFloat(x.s) })).filter((x) => !isNaN(x.v));
      const merged = [...pts, ...this._spark].sort((a, b) => a.t - b.t);
      this._spark = merged.filter((x, i) => i === 0 || x.t !== merged[i - 1].t);
      // Statistiques : jours (7 derniers) et heures (comparaison)
      const cs = this._solar ? [] : this._counters();
      const ids = (this._solar ? [c.energy, c.export_energy] : cs.map((k) => k.id)).filter(Boolean);
      if (ids.length) {
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const [days, hours] = await Promise.all([
          h.callWS({ type: "recorder/statistics_during_period", start_time: d0.toISOString(), statistic_ids: ids, period: "day", types: ["change"], units: { energy: "kWh" } }),
          h.callWS({ type: "recorder/statistics_during_period", start_time: d0.toISOString(), statistic_ids: ids, period: "hour", types: ["change", "state"], units: { energy: "kWh" } }),
        ]);
        const byDay = {}, byHour = {};
        if (this._solar) {
          const ps = this._num(c.price_self) || 0, pe = this._num(c.price_export) || 0;
          for (const s of days[c.energy] || []) { const k = new Date(s.start).toDateString(); byDay[k] = byDay[k] || { kwh: 0, exp: 0, t: s.start }; byDay[k].kwh += s.change || 0; }
          for (const s of days[c.export_energy] || []) { const k = new Date(s.start).toDateString(); if (byDay[k]) byDay[k].exp += s.change || 0; }
          for (const v of Object.values(byDay)) { const exp = Math.min(v.exp, v.kwh); v.eur = (v.kwh - exp) * ps + exp * pe; }
          for (const s of hours[c.energy] || []) byHour[s.start] = (byHour[s.start] || 0) + (s.change || 0);
        } else for (const k of cs) {
          const id = k.id, price = this._num(k.price) || 0;
          for (const s of days[id] || []) {
            const d = new Date(s.start).toDateString(), ch = s.change || 0;
            byDay[d] = byDay[d] || { kwh: 0, eur: 0, t: s.start, cols: {} }; byDay[d].kwh += ch; byDay[d].eur += ch * price;
            if (k.col) byDay[d].cols[k.col] = (byDay[d].cols[k.col] || 0) + ch;
          }
          for (const s of hours[id] || []) { byHour[s.start] = (byHour[s.start] || 0) + (s.change || 0); }
        }
        // couleur Tempo de chaque jour : l'index qui a le plus avancé
        for (const v of Object.values(byDay)) { const e = Object.entries(v.cols || {}).filter(([, x]) => x > 0.01).sort((a, b) => b[1] - a[1])[0]; v.col = e ? e[0] : null; }
        const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
        // Pour les index cumulés : valeur à minuit (fin de l'heure 23 h – minuit) et consommation du jour heure par heure
        const mid0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const base = {}, todayStat = {};
        for (const id of ids) {
          for (const st of hours[id] || []) {
            const t = typeof st.start === "number" ? st.start : new Date(st.start).getTime();
            if (t === mid0 - 3600000 && typeof st.state === "number") base[id] = st.state;
            if (t >= mid0) todayStat[id] = (todayStat[id] || 0) + (st.change || 0);
          }
          if (todayStat[id] === undefined && (hours[id] || []).length) todayStat[id] = 0;
        }
        this._base = base; this._todayStat = todayStat;
        const week = Object.entries(byDay).filter(([k]) => k !== todayKey).map(([, v]) => v).sort((a, b) => a.t - b.t).slice(-7);
        // Écart du jour : heures écoulées aujourd'hui vs moyenne des mêmes heures sur les 7 jours précédents
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const hoursDone = Object.keys(byHour).map(Number).filter((t) => t >= midnight).length;
        let todaySum = 0, prevSum = 0, prevDays = 0;
        for (const [t, v] of Object.entries(byHour)) if (Number(t) >= midnight) todaySum += v;
        for (let d = 1; d <= 7; d++) {
          const ds = midnight - d * 86400000; let s = 0, n = 0;
          for (let hh = 0; hh < hoursDone; hh++) { const v = byHour[ds + hh * 3600000]; if (v !== undefined) { s += v; n++; } }
          if (n === hoursDone && n > 0) { prevSum += s; prevDays++; }
        }
        const avg = prevDays ? prevSum / prevDays : 0;
        this._stats = { week, deltaPct: avg > 0 && hoursDone >= 1 ? (todaySum / avg - 1) * 100 : null };
      }
      this._err = null;
    } catch (e) { this._err = e?.message || String(e); this._fetched = 0; }
    this._render();
  }
  // ---- géométrie ----
  _pt(r, deg) { const a = (deg * Math.PI) / 180; return [160 + r * Math.cos(a), 160 - r * Math.sin(a)]; }
  _arc(r, a0, a1) { // a0 -> a1 en degrés (math), sens décroissant = horaire
    const [x0, y0] = this._pt(r, a0), [x1, y1] = this._pt(r, a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 < a0 ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  _powerAngle(v) {
    const sc = [...this._c.scale, this._c.max_power], A0 = 198, A1 = -18, step = (A0 - A1) / (sc.length - 1);
    v = Math.max(0, Math.min(v, sc[sc.length - 1]));
    for (let i = 0; i < sc.length - 1; i++) if (v <= sc[i + 1]) return A0 - step * (i + (v - sc[i]) / (sc[i + 1] - sc[i]));
    return A1;
  }
  _pctAngle(p) { p = Math.max(-25, Math.min(25, p)); return 270 + (p / 20) * 55; } // -20 → 215°, +20 → 325°
  // ---- rendu ----
  _render(full) {
    if (!this.shadowRoot || !this._c) return;
    const c = this._c, col = c.colors, s = this._slides[this._slide] || "power";
    const P = this._num(c.power);
    const sc = [...c.scale, c.max_power];
    const A0 = 198, A1 = -18, step = (A0 - A1) / (sc.length - 1);
    const pa = isNaN(P) ? A0 : this._powerAngle(P);
    let svg = "";
    // anneau haut
    svg += `<path d="${this._arc(128, A0, A1)}" class="trk"/>`;
    svg += `<path d="${this._arc(128, A0, Math.max(A1, Math.min(A0, pa)))}" class="prog" style="stroke:${col.power}"/>`;
    sc.forEach((v, i) => {
      const a = A0 - step * i, [x, y] = this._pt(148, a);
      const rot = 90 - a;
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" class="lbl">${i === sc.length - 1 ? "MAX" : fmtK(v)}</text>`;
    });
    const [nx0, ny0] = this._pt(117, pa), [nx1, ny1] = this._pt(139, pa);
    svg += `<line x1="${nx0}" y1="${ny0}" x2="${nx1}" y2="${ny1}" class="needle" style="stroke:${col.power}"/>`;
    const [ux, uy] = this._pt(111, 90);
    const hcNow = c.hc_display === "none" ? null : this._isHC();
    const tCol = this._tempo && c.hc_display !== "none" ? this._tempoColor(false) : null;
    const hcCol = tCol ? col[tCol] : hcNow === null ? null : hcNow ? col.hc : col.hp;
    // « Heures creuses / pleines » sous l'aiguille, à la place de « watts » (la valeur affiche déjà les W)
    if ((hcNow !== null || tCol) && (c.hc_display === "text" || c.hc_display === "both")) {
      const [hx, hy] = this._pt(101, 90);
      const per = hcNow === null ? "" : this._t(hcNow ? "hc_long" : "hp_long");
      const txt = tCol ? `${this._t("day_col", { c: this._t(tCol) })}${per ? " · " + this._t(hcNow ? "hc" : "hp") : ""}` : per;
      svg += `<text x="${hx}" y="${hy}" class="hcl" style="fill:${tCol === "blanc" ? "var(--primary-text-color)" : hcCol}">${txt}</text>`;
    } else svg += `<text x="${ux}" y="${uy}" class="unit">${this._t("watts")}</text>`;
    // anneau bas (écart %)
    const dp = this._stats?.deltaPct;
    svg += `<path d="${this._arc(128, 215, 325)}" class="trk"/>`;
    if (dp !== null && dp !== undefined) {
      const da = this._pctAngle(dp);
      svg += `<path d="${this._arc(128, 270, da)}" class="prog" style="stroke:${(this._solar ? dp >= 0 : dp <= 0) ? "#1fce8a" : "#ef7d42"}"/>`;
      const [mx0, my0] = this._pt(117, da), [mx1, my1] = this._pt(139, da);
      svg += `<line x1="${mx0}" y1="${my0}" x2="${mx1}" y2="${my1}" class="needle" style="stroke:#7fd3e3"/>`;
    }
    [-20, -10, 0, 10, 20].forEach((v) => {
      const a = this._pctAngle(v), [x, y] = this._pt(148, a);
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${(270 - a).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" class="lbl">${v}</text>`;
    });
    const [px, py] = this._pt(109, 270);
    svg += `<text x="${px}" y="${py}" class="unit pct">${dp === null || dp === undefined ? "%" : (dp > 0 ? "+" : "") + fmtNum(dp) + " %"}</text>`;

    // contenu du disque
    let body = "", color = col.power;
    let kHC = 0, kHP = 0, eurToday = 0;
    for (const k of this._solar ? [] : this._counters()) {
      const v = this._day(k.id) || 0;
      if (k.hc) kHC += v; else kHP += v;
      eurToday += v * (this._num(k.price) || 0);
    }
    const kwhToday = kHC + kHP, nCnt = this._solar ? 0 : this._counters().length;
    if (this._solar) {
      const prod = this._day(c.energy) || 0, exp = Math.min(this._day(c.export_energy) || 0, prod);
      const selfK = prod - exp, ps = this._num(c.price_self) || 0, pe = this._num(c.price_export) || 0;
      if (s === "power") {
        color = col.power;
        const sp = this._spark.filter((x) => x.t > Date.now() - 3600000);
        let spark = "";
        if (sp.length > 1) {
          const t0 = Date.now() - 3600000, max = Math.max(...sp.map((x) => x.v), 1);
          const ptsS = sp.map((x) => `${(((x.t - t0) / 3600000) * 140).toFixed(1)},${(38 - (x.v / max) * 34).toFixed(1)}`);
          ptsS.push(`140,${(38 - (P / max) * 34).toFixed(1)}`);
          spark = `<svg class="spark" viewBox="0 0 140 40"><polyline points="${ptsS.join(" ")}"/></svg>`;
        }
        const fc = this._num(c.forecast);
        body = `<div class="t1">${this._t("prod_rt")}</div><div class="big">${isNaN(P) ? "—" : fmtNum(P)} W</div>
          ${!isNaN(fc) ? `<div class="sub">${this._t("forecast_day", { x: fmtNum(fc, 1) })}</div>` : ""}${spark}`;
      } else if (s === "today") {
        color = col.today;
        body = `<div class="big">${fmtNum(selfK * ps + exp * pe, 2)} €</div><div class="mid">${this._t("kwh_produced", { x: fmtNum(prod, 1) })}</div>
          <div class="split"><span>${this._t("cons", { x: fmtNum(selfK, 1) })}</span><span>${this._t("resale", { x: fmtNum(exp, 1) })}</span></div>
          <div class="t2">${this._t("today")}</div>`;
      } else if (s === "week") {
        color = col.week;
        const w = this._stats?.week || [];
        const eur = w.reduce((a, x) => a + x.eur, 0), kwh = w.reduce((a, x) => a + x.kwh, 0), mx = Math.max(...w.map((x) => x.kwh), 0.001);
        body = `<div class="big">${w.length ? fmtNum(eur, 2) + " €" : "…"}</div><div class="mid">${w.length ? fmtNum(kwh, 1) + " kWh" : ""}</div>
          <div class="bars">${w.map((x) => `<i style="height:${Math.max(6, (x.kwh / mx) * 100)}%" title="${new Date(x.t).toLocaleDateString(NUMLOC, { weekday: "long" })} : ${fmtNum(x.kwh, 1)} kWh"></i>`).join("")}</div>
          <div class="t2">${this._t("over7")}</div>`;
      } else {
        color = col.self;
        const pct = prod > 0 ? (selfK / prod) * 100 : NaN;
        body = `<div class="t1">${this._t("selfcons")}</div><div class="big">${isNaN(pct) ? "—" : fmtNum(pct) + " %"}</div>
          <div class="sub">${this._t("kwh_consumed", { x: fmtNum(selfK, 1) })}</div><div class="sub">${this._t("kwh_sold", { x: fmtNum(exp, 1) })}</div>`;
      }
    } else if (s === "power") {
      color = col.power;
      const sp = this._spark.filter((x) => x.t > Date.now() - 3600000);
      let spark = "";
      if (sp.length > 1) {
        const t0 = Date.now() - 3600000, max = Math.max(...sp.map((x) => x.v), 1);
        const ptsS = sp.map((x) => `${(((x.t - t0) / 3600000) * 140).toFixed(1)},${(38 - (x.v / max) * 34).toFixed(1)}`);
        ptsS.push(`140,${(38 - (P / max) * 34).toFixed(1)}`);
        spark = `<svg class="spark" viewBox="0 0 140 40"><polyline points="${ptsS.join(" ")}"/></svg>`;
      }
      const sol = c.solar_power ? this._num(c.solar_power) : NaN;
      const tTom = this._tempo ? this._tempoColor(true) : null;
      body = `<div class="t1">${this._t("power_rt")}</div><div class="big">${isNaN(P) ? "—" : fmtNum(P)} W</div>
        ${!isNaN(sol) ? `<div class="sub">${this._t("w_produced", { x: fmtNum(sol) })}</div>` : ""}
        ${tTom ? `<div class="sub tom"><i style="background:${col[tTom]}"></i>${this._t("tomorrow", { c: this._t(tTom) })}</div>` : ""}${spark}`;
    } else if (s === "today") {
      color = col.today;
      const tDay = this._tempo ? this._tempoColor(false) : null;
      body = `<div class="big">${fmtNum(eurToday, 2)} €</div><div class="mid">${fmtNum(kwhToday, 1)} kWh</div>
        <div class="split"><span>${this._t("hc")} ${fmtNum(kHC, 1)}${nCnt >= 2 && kwhToday > 0 ? ` · ${fmtNum((kHC / kwhToday) * 100)} %` : ""}</span><span>${this._t("hp")} ${fmtNum(kHP, 1)}</span></div>
        <div class="t2">${this._t("today")}${tDay ? ` · ${this._t(tDay)}` : ""}</div>`;
    } else if (s === "week") {
      color = col.week;
      const w = this._stats?.week || [];
      const eur = w.reduce((a, x) => a + x.eur, 0), kwh = w.reduce((a, x) => a + x.kwh, 0), mx = Math.max(...w.map((x) => x.kwh), 0.001);
      body = `<div class="big">${w.length ? fmtNum(eur, 2) + " €" : "…"}</div><div class="mid">${w.length ? fmtNum(kwh, 1) + " kWh" : ""}</div>
        <div class="bars">${w.map((x) => `<i class="${x.col ? "tc" : ""}" style="height:${Math.max(6, (x.kwh / mx) * 100)}%${x.col ? `;background:${x.col === "blanc" ? "#f4f6f8" : col[x.col]}` : ""}" title="${new Date(x.t).toLocaleDateString(NUMLOC, { weekday: "long" })}${x.col ? ` (${this._t(x.col)})` : ""} : ${fmtNum(x.kwh, 1)} kWh · ${fmtNum(x.eur, 2)} €"></i>`).join("")}</div>
        <div class="t2">${this._t("over7")}</div>`;
    } else if (s === "solar") {
      color = col.solar;
      const sp = this._num(c.solar_power), se = this._kwh(c.solar_energy), ex = this._day(c.export_energy);
      const auto = !isNaN(se) && se > 0 && !isNaN(ex) ? Math.max(0, Math.min(100, ((se - ex) / se) * 100)) : NaN;
      body = `<div class="t1">${this._t("solar_prod")}</div><div class="big">${isNaN(sp) ? "—" : fmtNum(sp)} W</div>
        ${!isNaN(se) ? `<div class="sub">${this._t("kwh_today", { x: fmtNum(se, 1) })}</div>` : ""}
        ${!isNaN(auto) ? `<div class="sub">${this._t("selfcons_pct", { x: fmtNum(auto) })}</div>` : ""}`;
    }
    // fond du disque aux couleurs heures creuses / pleines
    if (hcCol && (c.hc_display === "color" || c.hc_display === "both") && (c.hc_pages === "all" || s === "power")) color = hcCol;
    const dots = this._slides.map((_, i) => `<b class="${i === this._slide ? "on" : ""}" data-i="${i}"></b>`).join("");

    if (full || !this._root) {
      this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; height:100%; }
        ha-card { padding: 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-sizing:border-box; height:100%; overflow:hidden; }
        .area { flex:1 1 auto; min-height:0; width:100%; display:flex; align-items:center; justify-content:center; }
        .wrap { position:relative; width:100%; aspect-ratio:1; flex:none; }
        .title { width:100%; text-align:center; font-size:16px; font-weight:600; color:var(--primary-text-color); letter-spacing:.3px; flex:none; }
        .title:empty { display:none; }
        ha-card.noframe { background:none !important; box-shadow:none !important; border:none !important;
          backdrop-filter:none !important; -webkit-backdrop-filter:none !important; --ha-card-background:transparent; }
        ha-card.noframe::before, ha-card.noframe::after { content:none !important; display:none !important; }
        svg.dial { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
        .face { fill: color-mix(in srgb, var(--primary-text-color) 4%, transparent); stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width:1; }
        .trk { fill:none; stroke: color-mix(in srgb, var(--primary-text-color) 18%, transparent); stroke-width:9; stroke-linecap:round; }
        .prog { fill:none; stroke-width:9; stroke-linecap:round; opacity:.85; transition: d .6s; }
        .needle { stroke-width:10; stroke-linecap:round; filter: drop-shadow(0 0 4px rgba(0,0,0,.35)); }
        .lbl { fill: var(--secondary-text-color); font-size:12px; text-anchor:middle; dominant-baseline:middle; letter-spacing:.3px; }
        .unit.pct { font-size:10px; font-weight:600; opacity:1; }
        .unit { fill: var(--secondary-text-color); font-size:8px; text-anchor:middle; dominant-baseline:middle; opacity:.8; }
        .hcl { font-size:10px; font-weight:800; letter-spacing:.8px; text-transform:uppercase; text-anchor:middle; dominant-baseline:middle; }
        .disc { position:absolute; left:50%; top:50%; width:57.5%; height:57.5%; overflow:hidden; transform:translate(-50%,-50%); border-radius:50%;
                display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff; cursor:pointer;
                box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08); transition: background .5s; user-select:none; padding:8px; box-sizing:border-box; }
        .t1 { font-size: clamp(6px, 4.2cqw, 16px); font-weight:600; text-transform:uppercase; letter-spacing:.5px; line-height:1.2; }
        .t2 { font-size: clamp(6px, 3.4cqw, 13px); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-top:6px; }
        .big { font-size: clamp(10px, 9.5cqw, 34px); font-weight:600; line-height:1.15; margin-top:4px; }
        .mid { font-size: clamp(7px, 5cqw, 18px); font-weight:500; opacity:.95; }
        .sub { font-size: clamp(6px, 3.4cqw, 12px); opacity:.9; margin-top:2px; }
        .split { display:flex; gap:10px; font-size: clamp(6px, 3.4cqw, 12px); opacity:.85; margin-top:6px; }
        .spark { width:62%; height:auto; margin-top:6px; overflow:visible; }
        .spark polyline { fill:none; stroke:#fff; stroke-width:1.6; stroke-linejoin:round; stroke-linecap:round; }
        .bars { display:flex; align-items:flex-end; gap:5px; height:12cqw; width:55%; margin-top:8px; }
        .bars i { flex:1; background:#fff; border-radius:1px; }
        .bars i.tc { box-shadow: 0 0 0 1.5px #fff; border-radius:2px; }
        .tom { display:flex; align-items:center; gap:5px; }
        .tom i { width:clamp(5px,2.4cqw,9px); height:clamp(5px,2.4cqw,9px); border-radius:50%; box-shadow:0 0 0 1.5px #fff; }
        .dots { position:absolute; left:50%; bottom:13.5%; transform:translateX(-50%); display:flex; gap:6px; }
        .dots b { width:clamp(4px,2cqw,7px); height:clamp(4px,2cqw,7px); border-radius:50%; border:1.5px solid #fff; opacity:.9; cursor:pointer; box-sizing:border-box; }
        .dots b.on { background:#fff; }
        .delta { position:absolute; left:0; right:0; bottom:1%; text-align:center; font-size:11px; color:var(--secondary-text-color); }
        .err { position:absolute; left:0; right:0; top:0; font-size:11px; color:var(--error-color); text-align:center; }
      </style>
      <ha-card><div class="title t-top"></div><div class="area"><div class="wrap" style="container-type:inline-size">
        <svg class="dial" viewBox="0 0 320 320"><circle cx="160" cy="160" r="158" class="face"/><g class="g"></g></svg>
        <div class="disc"><div class="content"></div><div class="dots"></div></div>
        <div class="err"></div>
      </div></div><div class="title t-bottom"></div></ha-card>`;
      this._root = this.shadowRoot.querySelector(".wrap");
      this._ro?.disconnect();
      this._ro = new ResizeObserver(() => this._fit());
      this._ro.observe(this.shadowRoot.querySelector(".area"));
      const disc = this._root.querySelector(".disc");
      disc.addEventListener("click", (e) => {
        const i = e.target?.dataset?.i;
        this._slide = i !== undefined ? Number(i) : (this._slide + 1) % this._slides.length;
        this._startTimer(); this._render();
      });
      disc.addEventListener("mouseenter", () => (this._hover = true));
      disc.addEventListener("mouseleave", () => (this._hover = false));
    }
    this._root.querySelector(".g").innerHTML = svg;
    const disc = this._root.querySelector(".disc");
    disc.style.background = `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 80%, #fff), ${color} 70%)`;
    disc.querySelector(".content").innerHTML = body;
    disc.querySelector(".content").style.cssText = "display:flex;flex-direction:column;align-items:center;width:100%;margin-top:-6%";
    disc.querySelector(".dots").innerHTML = dots;
    this._root.querySelector(".err").textContent = this._err ? this._t("error") + " : " + this._err : "";
    const pos = c.title_position || "top";
    this.shadowRoot.querySelector("ha-card").classList.toggle("noframe", c.show_frame === false);
    this.shadowRoot.querySelector(".t-top").textContent = c.title && pos === "top" ? c.title : "";
    this.shadowRoot.querySelector(".t-bottom").textContent = c.title && pos === "bottom" ? c.title : "";
    this._fit();
  }
  _fit() {
    // Diamètre = largeur disponible ; si la hauteur de la carte est fixée (redimensionnée), on prend le plus petit des deux
    const area = this.shadowRoot?.querySelector(".area"); if (!area || !this._root) return;
    const rows = this._c.grid_options?.rows;
    const fixedH = rows !== undefined && rows !== "auto";
    let d = area.clientWidth;
    if (fixedH && area.clientHeight > 0) d = Math.min(d, area.clientHeight);
    if (this._c.size > 0) d = Math.min(d, this._c.size);
    const px = Math.max(120, Math.floor(d)) + "px";
    if (this._root.style.width !== px) this._root.style.width = px;
  }
  static getConfigElement() { return document.createElement("holm-ecojoko-card-editor"); }
  static getStubConfig(hass) {
    const f = (re) => Object.keys(hass.states).find((e) => re.test(e));
    return { title: "", title_position: "top", mode: "conso", power: f(/^sensor\..*(temps_reel|power)$/) || "", max_power: 12000, rotate_seconds: 10 };
  }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 4, min_rows: 3 }; }
}

// ---------------- Éditeur visuel ----------------
// libellé d'un champ de l'éditeur dans la langue choisie
const labelOf = (l, n) => {
  let m = /^(energy|price)_(bleu|blanc|rouge)_(hc|hp)$/.exec(n);
  if (m) return tr(l, m[1] === "energy" ? "l_energy_tempo" : "l_price_tempo", { c: tr(l, m[2]), p: tr(l, m[3]) });
  m = /^c_(bleu|blanc|rouge)$/.exec(n);
  if (m) return tr(l, "l_c_tempo", { c: tr(l, m[1]) });
  return tr(l, "l_" + n);
};
const ent = (domains) => ({ entity: { domain: domains } });
const hex2rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return undefined; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (a) => Array.isArray(a) ? "#" + a.map((v) => Number(v).toString(16).padStart(2, "0")).join("") : a;
class HolmEcojokoCardEditor extends HTMLElement {
  setConfig(c) { this._config = { ...c }; this._update(); }
  set hass(h) { this._hass = h; this._update(); }
  _schema(solar, tempo) {
    const l = langOf(this._hass, this._config), L = (k) => tr(l, k);
    const colorKeys = solar ? ["power", "today", "week", "self", "hc", "hp"] : ["power", "today", "week", "solar", "hc", "hp", ...(tempo ? ["bleu", "blanc", "rouge"] : [])];
    const priceSel = ent(["sensor", "input_number", "number"]);
    const tariffEnt = tempo ? [
      ...["bleu", "blanc", "rouge"].flatMap((col) => [{ type: "grid", name: "", schema: [
        { name: `energy_${col}_hc`, selector: ent(["sensor"]) }, { name: `energy_${col}_hp`, selector: ent(["sensor"]) },
        { name: `price_${col}_hc`, selector: priceSel }, { name: `price_${col}_hp`, selector: priceSel }] }]),
      { name: "tempo_color", selector: ent(["sensor", "select", "input_select"]) },
      { name: "tempo_color_tomorrow", selector: ent(["sensor", "select", "input_select"]) },
    ] : [
      { name: "energy_hc", selector: ent(["sensor"]) },
      { name: "energy_hp", selector: ent(["sensor"]) },
      { name: "price_hc", selector: priceSel },
      { name: "price_hp", selector: priceSel },
    ];
    const entities = solar ? [
      { name: "power", required: true, selector: ent(["sensor"]) },
      { name: "energy", selector: ent(["sensor"]) },
      { name: "export_energy", selector: ent(["sensor"]) },
      { name: "price_self", selector: ent(["sensor", "input_number", "number"]) },
      { name: "price_export", selector: ent(["sensor", "input_number", "number"]) },
      { name: "forecast", selector: ent(["sensor"]) },
    ] : [
      { name: "power", required: true, selector: ent(["sensor"]) },
      { name: "tariff", selector: { select: { mode: "dropdown", options: [{ value: "hchp", label: L("o_hchp") }, { value: "tempo", label: L("o_tempo") }] } } },
      ...tariffEnt,
      { name: "solar_power", selector: ent(["sensor"]) },
      { name: "solar_energy", selector: ent(["sensor"]) },
      { name: "export_energy", selector: ent(["sensor"]) },
    ];
    return [
      { type: "grid", name: "", schema: [
        { name: "title", selector: { text: {} } },
        { name: "title_position", selector: { select: { mode: "dropdown", options: [{ value: "top", label: L("o_top") }, { value: "bottom", label: L("o_bottom") }] } } },
      ] },
      { name: "mode", selector: { select: { mode: "dropdown", options: [{ value: "conso", label: L("o_conso") }, { value: "solar", label: L("o_solar") }] } } },
      { type: "expandable", title: L("s_entities"), icon: "mdi:flash", flatten: true, expanded: true, schema: [...entities,
        { name: "energy_counter", selector: { select: { mode: "dropdown", options: [
          { value: "auto", label: L("o_auto") },
          { value: "daily", label: L("o_daily") },
          { value: "total", label: L("o_total") }] } } }] },
      { type: "expandable", title: L("s_hc"), icon: "mdi:leaf-circle-outline", flatten: true, schema: [
        { name: "hc_display", selector: { select: { mode: "dropdown", options: [
          { value: "text", label: L("o_text") }, { value: "color", label: L("o_color") },
          { value: "both", label: L("o_both") }, { value: "none", label: L("o_none") }] } } },
        { name: "hc_pages", selector: { select: { mode: "dropdown", options: [{ value: "power", label: L("o_pg_power") }, { value: "all", label: L("o_pg_all") }] } } },
        { name: "hc_source", selector: { entity: {} } },
        { name: "hc_values", selector: { text: {} } },
      ] },
      { type: "expandable", title: L("s_dial"), icon: "mdi:gauge", flatten: true, schema: [
        { type: "grid", name: "", schema: [
          { name: "max_power", selector: { number: { min: 100, max: 50000, step: 100, mode: "box", unit_of_measurement: "W" } } },
          { name: "rotate_seconds", selector: { number: { min: 0, max: 120, step: 1, mode: "box", unit_of_measurement: "s" } } },
        ] },
        { name: "scale", selector: { text: {} } },
        { name: "size", selector: { number: { min: 0, max: 1200, step: 10, mode: "box", unit_of_measurement: "px" } } },
        { name: "show_frame", selector: { boolean: {} } },
      ] },
      { type: "expandable", title: L("s_colors"), icon: "mdi:palette", flatten: true, schema: [
        { type: "grid", name: "", schema: colorKeys.map((k) => ({ name: "c_" + k, selector: { color_rgb: {} } })) },
      ] },
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: L("auto") }, ...Object.entries(LANG_NAMES).map(([value, label]) => ({ value, label }))] } } },
    ];
  }
  _data() {
    const c = this._config || {}, d = { language: "", title_position: "top", mode: "conso", tariff: "hchp", rotate_seconds: 10, size: 0, show_frame: true, energy_counter: "auto", hc_display: "text", hc_pages: "power", ...c };
    d.scale = Array.isArray(c.scale) ? c.scale.join(", ") : c.scale || "";
    for (const [k, v] of Object.entries(c.colors || {})) d["c_" + k] = hex2rgb(v);
    delete d.colors;
    return d;
  }
  _update() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (sc) => labelOf(langOf(this._hass, this._config), sc.name);
      this._form.addEventListener("value-changed", (ev) => {
        const v = { ...ev.detail.value };
        const out = { ...this._config };
        const colors = { ...(this._config.colors || {}) };
        for (const [k, val] of Object.entries(v)) {
          if (k.startsWith("c_")) { if (val) colors[k.slice(2)] = rgb2hex(val); else delete colors[k.slice(2)]; continue; }
          if (val === "" || val === undefined || val === null) delete out[k]; else out[k] = val;
        }
        if (Object.keys(colors).length) out.colors = colors; else delete out.colors;
        if (typeof out.scale === "string") {
          const arr = out.scale.split(/[;, ]+/).map(Number).filter((n) => !isNaN(n));
          if (arr.length >= 2) out.scale = arr; else delete out.scale;
        }
        if (!out.size) delete out.size;
        if (out.show_frame !== false) delete out.show_frame;
        if (out.energy_counter === "auto") delete out.energy_counter;
        if (out.hc_display === "text") delete out.hc_display;
        if (out.hc_pages === "power") delete out.hc_pages;
        if (out.tariff === "hchp") delete out.tariff;
        this._config = out;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: out }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._data();
    this._form.schema = this._schema(this._config.mode === "solar", this._config.tariff === "tempo");
  }
}
if (!customElements.get("holm-ecojoko-card-editor")) customElements.define("holm-ecojoko-card-editor", HolmEcojokoCardEditor);

if (!customElements.get("holm-ecojoko-card")) customElements.define("holm-ecojoko-card", HolmEcojokoCard);
window.customCards = window.customCards || [];
{ const l = langOf(document.querySelector("home-assistant")?.hass); window.customCards.push({ type: "holm-ecojoko-card", name: tr(l, "card_name"), description: tr(l, "card_desc"), preview: true }); }
})();

console.info("%c HOLM-ECOJOKO %c 1.4.0 ", "background:#1f6aa8;color:#111;border-radius:3px 0 0 3px", "background:#123;color:#fff;border-radius:0 3px 3px 0");
