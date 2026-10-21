# Changelog

## 1.2.0
- **Indicateur heures creuses / heures pleines** : « Heures creuses » ou « Heures pleines » sur le cadran, et/ou disque vert / orange (page puissance ou toutes les pages), couleurs réglables.
- Période détectée automatiquement : intégration [HOLM HP/HC](https://github.com/kaaribou/holm-tarif) (`binary_sensor.heures_creuses`), sinon compteur HC / HP qui avance, ou entité au choix (`hc_source`).

## 1.1.0
- **Index cumulés** ([#1](https://github.com/kaaribou/holm-ecojoko-card/issues/1)) : les compteurs HC / HP (et production / revente en mode solaire) peuvent être des index qui ne repartent jamais de zéro (Linky, ZLinky…). La consommation du jour est calculée à partir des statistiques (valeur actuelle − valeur à minuit), sans sous-compteur journalier. Option **Type de compteur** : automatique (par défaut), remis à zéro chaque jour, ou index cumulé.
- Les capteurs en Wh (ou MWh) sont convertis en kWh.
- **Part des heures creuses** (%) dans la page Aujourd'hui.

## 1.0.0
Première version publique.

- Cadran de puissance en temps réel (échelle logarithmique réglable) avec la courbe de la dernière heure.
- Pages Aujourd'hui (kWh et coût HC / HP) et 7 jours, défilement automatique.
- Écart de consommation du jour par rapport à la moyenne des 7 derniers jours aux mêmes heures.
- Mode production solaire avec autoconsommation et valorisation.
- Éditeur visuel, couleurs personnalisables.
