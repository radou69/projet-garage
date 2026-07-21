<?php
 
namespace App\Controller\Api;
 
use App\Entity\Reparation;
use App\Repository\ReparationRepository;
use App\Repository\VehiculeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
 
class ReparationController extends AbstractController
{
    private const STATUTS_VALIDES = ['en_attente', 'en_cours', 'terminee', 'annulee'];
 
    // Convertit une Reparation en tableau simple pour le JSON.
    private function toArray(Reparation $reparation): array
    {
        return [
            'id' => $reparation->getId(),
            'date' => $reparation->getDate()?->format('Y-m-d'),
            'description' => $reparation->getDescription(),
            'statut' => $reparation->getStatut(),
            'coutTotal' => $reparation->getCoutTotal(),
            'actif' => $reparation->isActif(),
            'vehicule' => [
                'id' => $reparation->getVehicule()?->getId(),
                'marque' => $reparation->getVehicule()?->getMarque(),
                'modele' => $reparation->getVehicule()?->getModele(),
                'immatriculation' => $reparation->getVehicule()?->getImmatriculation(),
            ],
        ];
    }
 
    // Liste + filtre par statut + recherche sur le véhicule (marque, modèle, immatriculation)
    #[Route('/api/reparations', name: 'api_reparations_list', methods: ['GET'])]
    public function list(Request $request, ReparationRepository $repo): JsonResponse
    {
        $statut = $request->query->get('statut');
        $search = $request->query->get('search');
 
        $qb = $repo->createQueryBuilder('r')
            ->leftJoin('r.vehicule', 'v')
            ->andWhere('r.actif = true');
 
        if ($statut) {
            if (!in_array($statut, self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $qb->andWhere('r.statut = :statut')->setParameter('statut', $statut);
        }
 
        if ($search) {
            $qb->andWhere('v.marque LIKE :s OR v.modele LIKE :s OR v.immatriculation LIKE :s OR r.description LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }
 
        $qb->orderBy('r.date', 'DESC');
 
        $reparations = $qb->getQuery()->getResult();
 
        return $this->json(array_map([$this, 'toArray'], $reparations));
    }
 
    // Créer une réparation — véhicule obligatoire, statut forcé à en_attente,
    // coutTotal initialisé à 0 (aucune pièce à la création : géré par le sous-CRUD ReparationPiece)
    #[Route('/api/reparations', name: 'api_reparations_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, VehiculeRepository $vehiculeRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
 
        if (empty($data['date'])) {
            return $this->json(['message' => 'La date est obligatoire.'], 400);
        }
 
        if (empty($data['vehicule_id'])) {
            return $this->json(['message' => 'Le véhicule est obligatoire pour une réparation.'], 400);
        }
 
        $vehicule = $vehiculeRepo->find($data['vehicule_id']);
        if (!$vehicule || !$vehicule->isActif()) {
            return $this->json(['message' => 'Véhicule introuvable ou inactif.'], 404);
        }
 
        try {
            $date = new \DateTime($data['date']);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD).'], 400);
        }
 
        $reparation = new Reparation();
        $reparation->setDate($date);
        $reparation->setDescription($data['description'] ?? null);
        $reparation->setStatut('en_attente');
        $reparation->setCoutTotal('0.00');
        $reparation->setVehicule($vehicule);
        // actif = true déjà par défaut sur l'entité
 
        $em->persist($reparation);
        $em->flush();
 
        return $this->json($this->toArray($reparation), 201);
    }
 
    // Consulter une réparation
    #[Route('/api/reparations/{id}', name: 'api_reparations_show', methods: ['GET'])]
    public function show(Reparation $reparation): JsonResponse
    {
        return $this->json($this->toArray($reparation));
    }
 
    // Modifier une réparation (date, description, ou transition de statut hors annulation)
    // coutTotal n'est jamais modifiable ici : il est recalculé par le sous-CRUD ReparationPiece.
    #[Route('/api/reparations/{id}', name: 'api_reparations_update', methods: ['PUT'])]
    public function update(Request $request, Reparation $reparation, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
 
        if (isset($data['date'])) {
            try {
                $reparation->setDate(new \DateTime($data['date']));
            } catch (\Exception $e) {
                return $this->json(['message' => 'Format de date invalide (attendu : YYYY-MM-DD).'], 400);
            }
        }
 
        if (array_key_exists('description', $data)) {
            $reparation->setDescription($data['description']);
        }
 
        // Une réparation terminée ou annulée a un statut figé : plus aucune transition possible.
        if (isset($data['statut']) && in_array($reparation->getStatut(), ['terminee', 'annulee'], true)) {
            return $this->json(['message' => 'Cette réparation est '.$reparation->getStatut().', son statut ne peut plus être modifié.'], 400);
        }
 
        // L'annulation passe obligatoirement par la route dédiée /cancel.
        if (isset($data['statut'])) {
            if ($data['statut'] === 'annulee') {
                return $this->json(['message' => 'Utilisez la route /api/reparations/{id}/cancel pour annuler une réparation.'], 400);
            }
            if (!in_array($data['statut'], self::STATUTS_VALIDES, true)) {
                return $this->json(['message' => 'Statut invalide.'], 400);
            }
            $reparation->setStatut($data['statut']);
        }
 
        $em->flush();
 
        return $this->json($this->toArray($reparation));
    }
 
    // Annuler une réparation — action métier dédiée, réservée au Patron
    // (contrairement à RendezVous : une réparation peut déjà engager du travail,
    // des pièces commandées et des conséquences financières).
    // Reste en base avec statut "annulee". Une réparation déjà terminée ou annulée
    // a un statut figé : l'annulation est refusée dans ces deux cas.
    #[Route('/api/reparations/{id}/cancel', name: 'api_reparations_cancel', methods: ['PATCH'])]
    public function cancel(Reparation $reparation, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
 
        if (in_array($reparation->getStatut(), ['terminee', 'annulee'], true)) {
            return $this->json(['message' => 'Cette réparation est '.$reparation->getStatut().', elle ne peut plus être annulée.'], 400);
        }
 
        $reparation->setStatut('annulee');
        $em->flush();
 
        return $this->json($this->toArray($reparation));
    }
 
    // Archiver une réparation (patron uniquement) — comme Client et Vehicule
    #[Route('/api/reparations/{id}', name: 'api_reparations_archive', methods: ['DELETE'])]
    public function archive(Reparation $reparation, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_PATRON');
 
        $reparation->setActif(false); // jamais de vraie suppression
        $em->flush();
 
        return $this->json(['message' => 'Réparation archivée avec succès.']);
    }
}
 