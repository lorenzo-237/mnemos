# Règle à suivre

- Pense bien à la suite de chaque PHASE à mettre à jour correctement le README.md

# TODO

## Phase 1

### EVO MVP

je fonctionne beaucoup avec de la prise ne main a distance ou je prends la main sur les machines principalement. Il me faut la possibilité d'avoir une vue optimisé ou je vois tous les sites d'un dossier, d'un tag, et surtout où je vois toutes les machines de ces sites là.

Je vais pouvoir préparer en amont des tâches à faire : transfererer les fichiers, lancer la routine sur le poste, vérifier si c'est bon etc. Les taches sont souvent les mêmes donc c'est pour ça que je dois avoir un pool de données de taches.

Ensuite je vais pouvoir lancer l'action préparer la mise à jour et dire
sur tous les postes j'associe tel taches à faire pour cette mise à jour, je sélectionne les tâches que je trouve pertinent à faire

ou bien je peux le faire unitairement par poste

il faut séparer les machines serveur / client car les tâches sur les serveurs sont quasiment tjrs différents des clients

Ensuite je vais pouvoir donc lancer l'action de "lancer la mise à jour" (il faut qu'elle soit existante, qu'elle est été préparée en amont)
et là je retrouve donc ma vu optimisé ou j'ai tous les postes et la listes des taches je vais pouvoir dire fait/pas fait

L'objectif est d'avoir un suivi pendant la mise à jour pour ne rien oublier, un système de couleur est interressant aussi pour avoir un visuel propre mais ça je te laisse gérer.

### Avancement

[x] Pouvoir créer des dossiers de sites et filtrer sur la liste des sites par dossier
[x] Pouvoir ajouter un tag à un site et filtrer sur la liste des sites par tag (le tag est pour tous les dossiers)
[x] améliorer le schéma site : metadonnées (icone simple, clé, valeur sous forme de texte), description, ajouter la notion de site obsolète, raison obsolète
[x] améliorer le schéma logiciel : metadonnées (icone simple, clé, valeur sous forme de texte), description
[x] EVO MVP - faites

## Phase 2

### EVO - Tache

une tache peut avoir un type:

- type par défaut => pas de traitement particulier
- type remplacement logiciel => doit sélectionner un logiciel dans liste disponible, au moment de l'ajout de la tâche dans la préparation de la mise à jour. La tache finale aura donc remplacement de 'X' en version 'Y' et le fait de valider cette tache modifiera pour la machine à laquelle la tache est associé la version du logiciel comme si on la modifié manuellement dans la fiche d'une machine

### Avancement

[x] sytème de toast simple efficace avec shadcn: pour afficher un petit toast sur les opérations qui en ont besoin
[x] La recherche de site par les filtres Dossiers et Tags, je dois pouvoir combiner plusieurs dossiers, et/ou plusieurs tag
[x] Mode sombre
[x] EVO - Tache - Implémentation complète: - Sélection du logiciel et version lors de la préparation de la session - Affichage du remplacement cible dans la vue de suivi - Mise à jour automatique du logiciel de la machine lors de la validation
[x] dans une session update, je peux démarrer une session mais j'aimerais pouvoir annuler le fait qu'elle soit démarrer
[x] dans une session update, je peux terminer une session mais j'aimerais pouvoir la réouvrir si je me suis trompé pour modifier les taches
[x] la vue /updates je préfères avoir un tableau propre plutôt que des Cards

## Phase 3

### Avancement

[x] attention si j'ajoue un logiciel: si un meme logiciel existe peut importe comment il est écrit tout en majuscule, minuscule, 1 lettre maj etc, il ne faut pas l'ajouter mais le réutiliser tout simplement
[x] améliorer la modal d'ajout de logiciel pour proposer 2 onglets : 1 - Créer logiciel 2 - Logiciel existant
[x] les logiciels ont aussi des métadonnées mais actuellement depuis la création de logiciel je ne peux pas en ajouter, pareil pour l'icone
[x] depuis la liste des logiciels je ne peux pas modifier, l'icone, les métadonnées
[x] depuis la liste des logiciels, je peux accéder à un tableau pour vérifier quel site, quel machine dispose du logiciel en question et voir sa version
[x] dans la session de mise à jour, les taches doivent être regrouper par machine, je dois pouvoir sélectionner une machine sources et ses taches et les cloner vers une ou plusieurs machine destination
[x] dans la session de mise à jour je dois pouvoir changer l'ordre des machines, et des taches dans les machines pour organiser proprement: migration schema avec machineOrder + taskOrder
[x] dans la session de mise à jour je dois pouvoir retirer / modifier une tache
[x] quand je démarre une session et que je modifie l'etat d'une tache pas besoin d'altérer l'ordre, l'ordre est toujours le même celui defini en amont

## Phase 4

### EVO - Authentification

Pour cette evolution, j'attends du résultat qu'il soit propre, compartimenté, lisible et professionnel pour un MVP perso.

j'aimerais que tu ajoutes une authentification simple via username/password, une authentification réussite donne un JWT dans les cookies
un utilisateur appartient a une organisation et c'est l'organisation qui possède les données en base (sites, taches, prise en main etc etc)
crée aussi un script qui crée l'utilisateur admin

Je veux un module qui reste simple et efficace, je ne veux pas de systeme trop avancé de droits: le MVP doit rester simple

- tout le monde dans l'organisation peut lire
- tout le monde dans l'organisation peut créer (ajoute dans mes données createdBy)
- tout le monde dans l'organisation peut modifier (ajoute dans mes données updatedBy)
- tout le monde avec le role 'gestionnaire' ou 'admin' peut supprimer un élément
- tout le monde avec le role 'gestionnaire' ou 'admin' peut copier / récupérer un mot de passe teamviewer, le role de base ne peut pas
- l'utisateur admin peut gérer les utilisateurs de l'outil et créer de nouvelles organisations
- l'utilisateur admin associe les utilisateurs aux organisations qu'il souhaite

Pas besoin d'afficher les utilisateurs qui ont crée, modifié etc car si j'en ai besoin je passerai par la base de données. On reste simple.

Regle simple: si l'utilisateur n'est pas authentifié je redirige vers une page 401 not authorized

### Avancement

[x] EVO - Authentification
[x] Possibilité de changer d'organisation simplement dans la sidebar
[x] question : actuellement le jwt contient le role, côté server action c'est le token qui décide en fonction du role. Pour les affichages je pense c'est bon. Mais côté serveur ne faut il pas appeler la base pour vérifier les informations extraites du token ?

### Phase 5 - Installation

[x] proposer ensuite une procédure via l'interface de première installation qui donne lieu à la création du premier user ADMIN et de la première organisation
[x] prposer un déploiement en conteneur
[x] adapter le README pour expliquer concrètement comment déployer l'application

### Phase 6 - Vérifications

[x] afficher quelque part sur la sidebar le nom de l'utilisateur connecté
[x] créer la page parametres manquantes où l'utilisateur connecté peut modifier son mot de passe
[x] dans la page paramètres si l'utilisateur est minimum 'GESTIONNAIRE', il peut modifier des noms de dossier, et supprimer des dossiers vides*
[x] dans la page paramètres si l'utilisateur est minimum 'GESTIONNAIRE', il peut modifier des tags, et supprimer des tags vides*
[x] afficher proprement les erreurs dans une modal d'erreur
[x] empecher la suppression de site, de taches, de machine si l'utilisateur est un simple 'UTILISATEUR'
