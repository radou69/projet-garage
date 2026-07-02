# Synopsis — Outil de Gestion AutoGest

## Contexte
Un garagiste artisan disposant d'un atelier physique et d'un employé souhaite 
digitaliser la gestion quotidienne de son activité. Il intervient aussi bien dans 
son atelier que chez ses clients, il a donc besoin d'un outil accessible depuis 
un PC et un téléphone/tablette.

## Objectif
Développer une application web responsive permettant de gérer l'ensemble de 
l'activité du garage : clients, rendez-vous, réparations, pièces, devis, 
factures et vente de véhicules.

## Utilisateurs
- **Patron** : accès complet (finances, devis, factures, encaissements, gestion employé)
- **Employé** : accès limité (RDV, réparations, pièces, consultation devis)

## Fonctionnalités principales
- Gestion des clients et rendez-vous
- Suivi des réparations et pièces détachées
- Création de devis et factures
- Encaissement et suivi financier (patron uniquement)
- Vente de véhicules d'occasion

## Technologies envisagées
- Back-End : Node.js / API REST
- Front-End : Angular
- Base de données : MySQL
- Déploiement : Docker