J'ai agrandi tous les dialogues de l'application pour une meilleure expérience sur desktop. Voici les modifications apportées:

## Dialogues simples (2 champs max) → max-w-2xl (672px)

folder-form-dialog.tsx - Création/modification de dossiers
tag-form-dialog.tsx - Création/modification de tags
update-software-dialog.tsx - Mise à jour de version de logiciel

## Dialogues moyens (3-4 champs) → max-w-3xl (768px)

machine-form-dialog.tsx - Création/modification de machines
add-installation-dialog.tsx - Ajout d'installation
machine-quick-view.tsx - Vue rapide d'une machine

## Dialogues complexes (nombreux champs/contenu riche) → max-w-4xl à max-w-5xl

task-form-dialog.tsx - Formulaire de tâche (max-w-3xl → max-w-4xl)
prepare-session-view.tsx - Configuration SOFTWARE_REPLACEMENT (max-w-2xl → max-w-4xl)
update-session-form.tsx - Card de création de session (max-w-2xl → max-w-4xl)
site-form-dialog.tsx - Formulaire de site complet (max-w-4xl → max-w-5xl)
site-machines-dialog.tsx - Liste des machines d'un site (max-w-4xl → max-w-5xl)

## Avantages

Meilleure utilisation de l'espace sur desktop
Moins de scroll vertical nécessaire
Formulaires plus aérés et lisibles
Maintien de la responsivité mobile (les max-w n'affectent pas les petits écrans)
