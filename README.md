#Transcode

## Prérequis
(Les dernières version)
  * MongoDB
  * NodeJS / npm 
  * Gulp

## Configuration & Installation & Lancement de l'app

Toutes les variables d'environnement sont situées dans les fichiers client/src/app/config.js et server/.env
 * Renseigner les identifiants de connexion aux API (FB et Google) pour que l'auth sociale fonctionne (j'ai laissé les miens, mais ça ne permet de se connecter qu'avec mes comptes FB et Google+)
 * Créer une DB dans Mongo et renseigner son nom dans server/.env

Lancer Mongo 

Dans client/
    > npm install
    > bower install
    > gulp

Dans server/ :
    > npm install
    > node apps.js
