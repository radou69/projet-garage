CREATE TABLE RENDEZ_VOUS(
   id_rdv COUNTER,
   date_heure DATETIME,
   description VARCHAR(255),
   statut VARCHAR(20),
   PRIMARY KEY(id_rdv)
);

CREATE TABLE REPARATION(
   id_reparation COUNTER,
   date_ DATE,
   description VARCHAR(255),
   statut VARCHAR(20),
   cout_total DECIMAL(15,2),
   PRIMARY KEY(id_reparation)
);

CREATE TABLE FACTURE(
   id_facture COUNTER,
   date_ DATE,
   montant_ttc DECIMAL(15,2),
   montant_acompte DECIMAL(15,2),
   date_acompte DATE,
   statut VARCHAR(20),
   PRIMARY KEY(id_facture)
);

CREATE TABLE VEHICULE(
   id_vehicule COUNTER,
   marque VARCHAR(50),
   modele VARCHAR(50),
   immatriculation VARCHAR(15),
   annee INT,
   kilometrage INT,
   id_reparation INT NOT NULL,
   PRIMARY KEY(id_vehicule),
   FOREIGN KEY(id_reparation) REFERENCES REPARATION(id_reparation)
);

CREATE TABLE PIECE(
   id_piece COUNTER,
   nom VARCHAR(100),
   prix_unitaire DECIMAL(15,2),
   PRIMARY KEY(id_piece)
);

CREATE TABLE DEVIS(
   id_devis COUNTER,
   date_ DATE,
   montant_ht DECIMAL(15,2),
   montant_ttc DECIMAL(15,2),
   statut VARCHAR(20),
   id_facture INT NOT NULL,
   PRIMARY KEY(id_devis),
   FOREIGN KEY(id_facture) REFERENCES FACTURE(id_facture)
);

CREATE TABLE CLIENT(
   id_client COUNTER,
   nom VARCHAR(50),
   prenom VARCHAR(50),
   telephone VARCHAR(20),
   email VARCHAR(100),
   adresse VARCHAR(150),
   id_devis INT NOT NULL,
   id_rdv INT NOT NULL,
   id_vehicule INT NOT NULL,
   PRIMARY KEY(id_client),
   FOREIGN KEY(id_devis) REFERENCES DEVIS(id_devis),
   FOREIGN KEY(id_rdv) REFERENCES RENDEZ_VOUS(id_rdv),
   FOREIGN KEY(id_vehicule) REFERENCES VEHICULE(id_vehicule)
);

CREATE TABLE VEHICULE_OCCASION(
   id_occasion COUNTER,
   marque VARCHAR(50),
   modele VARCHAR(50),
   annee INT,
   kilometrage INT,
   prix DECIMAL(15,2),
   statut VARCHAR(20),
   id_client INT,
   PRIMARY KEY(id_occasion),
   FOREIGN KEY(id_client) REFERENCES CLIENT(id_client)
);

CREATE TABLE UTILISATEUR(
   id_utilisateur COUNTER,
   nom VARCHAR(50),
   email VARCHAR(100),
   mot_de_passe VARCHAR(255),
   role VARCHAR(20),
   id_client INT NOT NULL,
   PRIMARY KEY(id_utilisateur),
   FOREIGN KEY(id_client) REFERENCES CLIENT(id_client)
);

CREATE TABLE utilise(
   id_reparation INT,
   id_piece_quantité INT,
   PRIMARY KEY(id_reparation, id_piece_quantité),
   FOREIGN KEY(id_reparation) REFERENCES REPARATION(id_reparation),
   FOREIGN KEY(id_piece_quantité) REFERENCES PIECE(id_piece)
);
