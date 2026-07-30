<?php

namespace App\Controller\Api;

use App\Entity\Facture;
use App\Entity\FactureItem;
use App\Entity\User;
use App\Repository\FactureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class FactureController extends AbstractController
{
    private const STATUTS_VALIDES = ['emise', 'acompte', 'payee', 'annulee'];

    // Convertit une Facture en tableau simple pour le JSON.
    private function toArray(Facture $facture): array
    {
        return [
            'id' => $facture->getId(),
            'date' => $facture->getDate()?->format('Y-m-d'),
            'montantTtc' => $facture->getMontantTtc(),
            'montantAcompte' => $facture->getMontantAcompte(),
            'dateAcompte' => $facture->getDateAcompte()?->format('Y-m-d'),
            'statut' => $facture->getStatut(),
            'actif' => $facture->isActif(),
            'client' => [
                'id' => $facture->getClient()?->getId(),
                'nom' => $facture->getClient()?->getNom(),
                'prenom' => $facture->getClient()?->getPrenom(),
            ],
            'devisId' => $facture->getDevis()?->getId(),
        ];
    }

    // Convertit une ligne FactureItem en tableau simple pour le JSON.
    private function itemToArray(FactureItem $ligne): array
    {
        return [
            'id' => $ligne->getId(),
            'designation' => $ligne->getDesignation(),
            'quantite' => $ligne->getQuantite(),
            'prixUnitaire' => $ligne->getPrixUnitaire(),
            'montant' => $ligne->getMontant(),
        ];
    }

    // Vérifie que la facture appartient bien au tenant courant (patron ou son employé) —
    // 404 (pas 403) pour ne pas confirmer l'existence d'une facture d'un autre garage.
    private function verifierProprietaire(Facture $facture): void
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($facture->getClient()?->getUtilisateur() !== $user->getTenant()) {
            throw $this->createNotFoundException();
        }
    }

    // Liste + filtre par statut + recherche sur le nom du client
    #[Route('/api/factures', name: 'api_factures_list', methods: ['GET'])]
    public function list(Request $request, FactureRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $statut = $request->query->get('statut');
        $search = $request->query->get('search');

        $qb = $repo->createQueryBuilder('f')
            ->leftJoin('f.client', 'c')
            ->andWhere('f.actif = true')
            ->andWhere('c.utilisateur = :tenant')
            ->setParameter('tenant', $user->getTenant());

        if ($statut) {
            if (!in_array($statut, self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $qb->andWhere('f.statut = :statut')->setParameter('statut', $statut);
        }

        if ($search) {
            $qb->andWhere('c.nom LIKE :s OR c.prenom LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $qb->orderBy('f.date', 'DESC');

        $factures = $qb->getQuery()->getResult();

        return $this->json(array_map([$this, 'toArray'], $factures));
    }

    // Consulter une facture
    #[Route('/api/factures/{id}', name: 'api_factures_show', methods: ['GET'])]
    public function show(Facture $facture): JsonResponse
    {
        $this->verifierProprietaire($facture);

        return $this->json($this->toArray($facture));
    }

    // Lister les lignes d'une facture (lecture seule : une facture émise est un document figé,
    // ses lignes sont copiées depuis le Devis à la transformation et ne sont plus modifiables)
    #[Route('/api/factures/{id}/items', name: 'api_factures_items_list', methods: ['GET'])]
    public function items(Facture $facture): JsonResponse
    {
        $this->verifierProprietaire($facture);

        return $this->json(array_map([$this, 'itemToArray'], $facture->getFactureItems()->toArray()));
    }

    // Enregistrer un acompte reçu (patron uniquement, impact financier).
    // Passe le statut à "payee" si l'acompte couvre le montant total, sinon à "acompte".
    #[Route('/api/factures/{id}/acompte', name: 'api_factures_acompte', methods: ['PATCH'])]
    public function acompte(Request $request, Facture $facture, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
        $this->verifierProprietaire($facture);

        if (in_array($facture->getStatut(), ['payee', 'annulee'], true)) {
            return $this->json(['message' => 'Cette facture est '.$facture->getStatut().', aucun acompte ne peut plus être enregistré.'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['montantAcompte']) || !is_numeric($data['montantAcompte']) || (float) $data['montantAcompte'] <= 0) {
            return $this->json(['message' => 'montantAcompte doit être un nombre positif.'], 400);
        }

        $versement = (float) $data['montantAcompte'];

        try {
            $dateAcompte = isset($data['dateAcompte']) ? new \DateTime($data['dateAcompte']) : new \DateTime();
        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD).'], 400);
        }

        // Cumule ce versement avec les acomptes déjà enregistrés — chaque appel représente
        // un nouveau paiement reçu, pas le nouveau total (sinon les versements précédents
        // sont écrasés et perdus).
        $nouveauMontantAcompte = (float) $facture->getMontantAcompte() + $versement;

        if ($nouveauMontantAcompte > (float) $facture->getMontantTtc()) {
            return $this->json(['message' => 'Le montant total des acomptes dépasse le montant de la facture.'], 400);
        }

        $facture->setMontantAcompte(number_format($nouveauMontantAcompte, 2, '.', ''));
        $facture->setDateAcompte($dateAcompte);
        $facture->setStatut($nouveauMontantAcompte >= (float) $facture->getMontantTtc() ? 'payee' : 'acompte');

        $em->flush();

        return $this->json($this->toArray($facture));
    }

    // Annuler une facture (patron uniquement) — impossible si déjà payée intégralement ou déjà annulée
    #[Route('/api/factures/{id}/annuler', name: 'api_factures_annuler', methods: ['PATCH'])]
    public function annuler(Facture $facture, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
        $this->verifierProprietaire($facture);

        if (in_array($facture->getStatut(), ['payee', 'annulee'], true)) {
            return $this->json(['message' => 'Cette facture est '.$facture->getStatut().', elle ne peut plus être annulée.'], 400);
        }

        $facture->setStatut('annulee');
        $em->flush();

        return $this->json($this->toArray($facture));
    }

    // Archiver une facture (patron uniquement) — comme les autres entités
    #[Route('/api/factures/{id}', name: 'api_factures_archive', methods: ['DELETE'])]
    public function archive(Facture $facture, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
        $this->verifierProprietaire($facture);

        $facture->setActif(false); // jamais de vraie suppression
        $em->flush();

        return $this->json(['message' => 'Facture archivée avec succès.']);
    }
}