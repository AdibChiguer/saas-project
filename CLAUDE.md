# CLAUDE.md — Application de facturation automatisée

> Fichier de référence pour tout assistant IA ou développeur travaillant sur ce projet.
> Mono-utilisateur · Local-first · Pas de multi-tenancy · Pas d'auth complexe.

---

## 1. Vision du projet

**Problème résolu** : Un travailleur indépendant (ou une petite entreprise) perd plusieurs heures par semaine à générer manuellement des devis et des factures pour ses clients.

**Solution** : Une application web locale qui automatise la saisie des journées de travail, la génération des devis Excel par client en fin de semaine, puis la création et l'envoi automatique des factures PDF par email.

**Principe clé** : L'utilisateur saisit ses notes de travail chaque jour (lundi au samedi). En fin de semaine, le système génère automatiquement un devis par client, puis — si le devis est accepté — une facture est générée et envoyée par email.

---

## 2. Contexte mono-utilisateur

Ce projet est conçu pour **un seul utilisateur** (le freelance ou l'indépendant lui-même).

- Pas de système multi-tenant
- Pas de gestion de rôles ou permissions
- Pas d'abonnement ou de facturation SaaS
- Authentification simple : login/mot de passe local (un seul compte)
- L'application peut tourner en local ou sur un petit VPS personnel

> Si à l'avenir le projet évolue vers un SaaS multi-utilisateurs, voir la section 10 (Évolutions futures).

---

## 3. Flux métier principal

### 3.1 Saisie journalière (lundi → samedi)

L'utilisateur enregistre chaque jour de travail avec :

| Champ | Type | Description |
|---|---|---|
| `date` | Date | Jour de travail |
| `client_id` | UUID | Client pour lequel le travail est effectué |
| `lieu` | Texte | Lieu de travail (chantier, bureau client, remote…) |
| `heure_debut` | Heure | Heure de début |
| `heure_fin` | Heure | Heure de fin |
| `heures_total` | Float | Calculé automatiquement |
| `mode_tarif` | Enum | `horaire` ou `forfait` |
| `prix_unitaire` | Float | Prix/heure ou prix fixe du projet |
| `montant` | Float | Calculé : heures × prix (horaire) ou prix fixe (forfait) |
| `notes` | Texte | Observations optionnelles |

### 3.2 Fin de semaine — génération automatique des devis

Le dimanche soir (ou manuellement), le système :

1. Regroupe toutes les notes de la semaine **par client**
2. Calcule le total des heures et le montant dû **pour chaque client**
3. Génère **un devis Excel distinct par client** (ex : 3 clients = 3 devis)
4. Envoie chaque devis au client correspondant par email

> **Règle importante** : Si l'utilisateur a travaillé pour 3 clients dans la semaine, il y aura exactement 3 devis générés, chacun avec les détails des jours/heures travaillés pour ce client.

### 3.3 Validation du devis

Pour chaque devis envoyé, deux cas possibles :

- **Devis accepté** → le système génère automatiquement la facture PDF et l'envoie au client
- **Devis refusé / sans réponse** → archivé avec possibilité de relance manuelle

L'utilisateur met à jour le statut du devis dans l'interface (ou via un lien de confirmation client).

### 3.4 Génération de la facture

Une fois le devis marqué comme accepté :

1. **Fusion des données** : lignes du devis + infos client (nom, email, logo)
2. **Construction** : numéro de facture unique auto-incrémenté, date d'émission, conditions de paiement
3. **Calcul** : sous-total HT, TVA (taux configurable), total TTC
4. **Export PDF** : mise en page avec en-tête, tableau des prestations, totaux, mentions légales
5. **Archivage** : PDF stocké localement, lié au devis source
6. **Envoi email** : facture PDF envoyée au client en pièce jointe

---

## 4. Modèle de données

### Tables principales

#### `clients`
```sql
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT NOT NULL,
  email       TEXT NOT NULL,
  telephone   TEXT,
  adresse     TEXT,
  logo_url    TEXT,
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

#### `work_logs` (notes de travail journalières)
```sql
CREATE TABLE work_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id),
  jour          DATE NOT NULL,
  heure_debut   TIME NOT NULL,
  heure_fin     TIME NOT NULL,
  heures_total  NUMERIC(5,2) NOT NULL,
  lieu          TEXT,
  mode_tarif    TEXT CHECK (mode_tarif IN ('horaire', 'forfait')) NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant       NUMERIC(10,2) NOT NULL,
  notes         TEXT,
  semaine_ref   TEXT,          -- ex: '2025-W03' pour identifier la semaine
  created_at    TIMESTAMP DEFAULT NOW()
);
```

#### `devis`
```sql
CREATE TABLE devis (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES clients(id),
  numero         TEXT NOT NULL UNIQUE,  -- ex: 'DEV-2025-001'
  semaine_ref    TEXT NOT NULL,         -- ex: '2025-W03'
  date_emission  DATE NOT NULL,
  statut         TEXT CHECK (statut IN ('brouillon','envoye','accepte','refuse','archive')) DEFAULT 'brouillon',
  total_ht       NUMERIC(10,2) NOT NULL,
  taux_tva       NUMERIC(5,2) DEFAULT 20.00,
  total_tva      NUMERIC(10,2) NOT NULL,
  total_ttc      NUMERIC(10,2) NOT NULL,
  fichier_excel  TEXT,                  -- chemin vers le fichier Excel
  notes          TEXT,
  envoye_at      TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

#### `devis_lignes`
```sql
CREATE TABLE devis_lignes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id     UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  work_log_id  UUID REFERENCES work_logs(id),
  description  TEXT NOT NULL,  -- ex: 'Lundi 13/01 - Développement frontend'
  quantite     NUMERIC(5,2) NOT NULL,
  unite        TEXT NOT NULL,  -- 'heure' ou 'forfait'
  prix_unitaire NUMERIC(10,2) NOT NULL,
  montant_ht   NUMERIC(10,2) NOT NULL
);
```

#### `factures`
```sql
CREATE TABLE factures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID NOT NULL REFERENCES devis(id),
  client_id       UUID NOT NULL REFERENCES clients(id),
  numero          TEXT NOT NULL UNIQUE,  -- ex: 'FAC-2025-001'
  date_emission   DATE NOT NULL,
  date_echeance   DATE NOT NULL,
  statut          TEXT CHECK (statut IN ('generee','envoyee','payee','en_retard')) DEFAULT 'generee',
  total_ht        NUMERIC(10,2) NOT NULL,
  taux_tva        NUMERIC(5,2) DEFAULT 20.00,
  total_tva       NUMERIC(10,2) NOT NULL,
  total_ttc       NUMERIC(10,2) NOT NULL,
  fichier_pdf     TEXT,                  -- chemin vers le PDF
  envoye_at       TIMESTAMP,
  paye_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

#### `parametres` (configuration utilisateur)
```sql
CREATE TABLE parametres (
  cle    TEXT PRIMARY KEY,
  valeur TEXT NOT NULL
);

-- Valeurs par défaut à insérer :
-- INSERT INTO parametres VALUES
--   ('nom_entreprise', 'Mon Entreprise'),
--   ('email_expediteur', 'moi@email.com'),
--   ('adresse_entreprise', '...'),
--   ('taux_tva_defaut', '20'),
--   ('delai_paiement_jours', '30'),
--   ('mentions_legales', '...'),
--   ('prefixe_devis', 'DEV'),
--   ('prefixe_facture', 'FAC'),
--   ('logo_url', '');
```

### Relations clés

```
clients ──< work_logs
clients ──< devis
clients ──< factures
devis   ──< devis_lignes
devis   ──< factures (1 devis → 0 ou 1 facture)
work_logs ──< devis_lignes (traçabilité)
```

---

## 5. Stack technique recommandée

### Backend
- **Runtime** : Node.js 20+ avec TypeScript
- **Framework** : Express.js ou Fastify
- **ORM** : Prisma (schéma type-safe, migrations propres)
- **Base de données** : PostgreSQL (ou SQLite pour une version 100% locale)
- **Jobs asynchrones** : BullMQ + Redis (pour la génération PDF et l'envoi email en background)
- **Génération Excel** : `exceljs` ou `xlsx`
- **Génération PDF** : `puppeteer` (HTML → PDF) ou `pdfkit`
- **Envoi email** : Nodemailer + SMTP (Gmail, Mailgun, ou serveur local)
- **Validation** : Zod

### Frontend
- **Framework** : Next.js 14+ (App Router) ou React + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Gestion d'état** : Zustand ou React Query (TanStack Query)
- **Formulaires** : React Hook Form + Zod

### Infrastructure (mono-utilisateur)
- **Option 1 — Local** : Docker Compose (app + PostgreSQL + Redis)
- **Option 2 — VPS** : Railway, Render, ou un VPS OVH/DigitalOcean
- **Stockage fichiers** : dossier local `/storage` (ou Cloudflare R2 si hébergé)
- **Auth** : Session simple avec `express-session` + bcrypt (un seul compte)

### Structure du projet
```
project/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── clients.ts
│   │   │   ├── work-logs.ts
│   │   │   ├── devis.ts
│   │   │   └── factures.ts
│   │   ├── services/
│   │   │   ├── devis.service.ts      # logique de génération des devis
│   │   │   ├── facture.service.ts    # logique de génération des factures
│   │   │   ├── pdf.service.ts        # export PDF
│   │   │   ├── excel.service.ts      # export Excel
│   │   │   └── email.service.ts      # envoi email
│   │   ├── jobs/
│   │   │   └── weekly-generation.job.ts  # cron hebdomadaire
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.ts
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── work-logs/
│   │   ├── clients/
│   │   ├── devis/
│   │   └── factures/
├── storage/
│   ├── devis/        # fichiers Excel générés
│   ├── factures/     # fichiers PDF générés
│   └── logos/        # logos clients uploadés
├── docker-compose.yml
└── CLAUDE.md
```

---

## 6. Logique métier — règles importantes

### Numérotation automatique
- Devis : `DEV-YYYY-NNN` (ex: `DEV-2025-001`)
- Factures : `FAC-YYYY-NNN` (ex: `FAC-2025-001`)
- Le compteur repart à 001 chaque année

### Référence de semaine
- Format ISO : `YYYY-WNN` (ex: `2025-W03`)
- La semaine va du lundi au samedi (le dimanche est le jour de génération)
- Un devis ne peut être généré que s'il existe au moins une note de travail pour ce client dans cette semaine

### Calcul des montants
```typescript
// Mode horaire
montant = heures_total * prix_unitaire

// Mode forfait
montant = prix_unitaire  // fixe, indépendant des heures

// Total devis
total_ht  = SUM(montant de chaque ligne)
total_tva = total_ht * (taux_tva / 100)
total_ttc = total_ht + total_tva
```

### Contrainte devis → facture
- Une facture ne peut être créée que si le devis est en statut `accepte`
- Un devis ne peut avoir qu'une seule facture associée
- La modification d'un devis est bloquée si une facture existe déjà

### Statuts et transitions

**Devis** :
```
brouillon → envoye → accepte → [facture générée]
                   → refuse  → archive
```

**Facture** :
```
generee → envoyee → payee
                  → en_retard (si date_echeance dépassée)
```

---

## 7. API REST — endpoints principaux

### Clients
```
GET    /api/clients              — liste tous les clients
POST   /api/clients              — créer un client
GET    /api/clients/:id          — détail client + historique
PUT    /api/clients/:id          — modifier un client
DELETE /api/clients/:id          — supprimer (si aucun document actif)
```

### Notes de travail
```
GET    /api/work-logs            — liste (filtrable par semaine, client)
POST   /api/work-logs            — créer une note
PUT    /api/work-logs/:id        — modifier
DELETE /api/work-logs/:id        — supprimer
GET    /api/work-logs/week/:ref  — toutes les notes d'une semaine (ex: 2025-W03)
```

### Devis
```
GET    /api/devis                         — liste tous les devis
POST   /api/devis/generate/:semaine_ref   — générer les devis de la semaine
GET    /api/devis/:id                     — détail devis + lignes
PUT    /api/devis/:id                     — modifier un devis (si statut brouillon)
POST   /api/devis/:id/send                — envoyer par email au client
POST   /api/devis/:id/accept              — marquer comme accepté
POST   /api/devis/:id/refuse              — marquer comme refusé
GET    /api/devis/:id/download            — télécharger le fichier Excel
```

### Factures
```
GET    /api/factures             — liste toutes les factures
GET    /api/factures/:id         — détail facture
POST   /api/factures/:id/send    — (re)envoyer par email
POST   /api/factures/:id/paid    — marquer comme payée
GET    /api/factures/:id/download — télécharger le PDF
```

### Paramètres
```
GET    /api/parametres           — lire tous les paramètres
PUT    /api/parametres           — mettre à jour les paramètres
```

---

## 8. Job hebdomadaire automatique

Le job tourne chaque **dimanche à 20h00** (configurable).

```typescript
// weekly-generation.job.ts

async function weeklyGeneration(semaineRef: string) {
  // 1. Récupérer toutes les notes de la semaine
  const logs = await getWorkLogsByWeek(semaineRef);

  // 2. Grouper par client
  const byClient = groupBy(logs, 'client_id');

  // 3. Pour chaque client : générer un devis
  for (const [clientId, clientLogs] of Object.entries(byClient)) {
    const client = await getClient(clientId);

    // Calculer les totaux
    const lignes = buildLignes(clientLogs);
    const totaux = calculateTotaux(lignes);

    // Créer le devis en base
    const devis = await createDevis({ client, lignes, totaux, semaineRef });

    // Générer le fichier Excel
    await generateExcel(devis);

    // Envoyer par email au client
    await sendDevisEmail(client, devis);

    // Log d'audit
    await logAudit('devis_genere', { devisId: devis.id, clientId });
  }
}
```

**Déclenchement manuel possible** depuis l'interface : bouton "Générer les devis de cette semaine".

---

## 9. Structure du devis Excel

Chaque fichier Excel généré contient :

**Onglet 1 — En-tête**
- Logo de l'entreprise (utilisateur) + logo du client
- Informations utilisateur (nom, adresse, email, téléphone)
- Informations client (nom, adresse, email)
- Numéro de devis, date d'émission, référence semaine

**Onglet 2 — Détail des prestations**
| Date | Description | Lieu | Heures | Tarif | Montant HT |
|------|-------------|------|--------|-------|-----------|
| Lun 13/01 | Développement | Bureau client | 8h | 50€/h | 400€ |
| Mar 14/01 | Réunion + dev | Remote | 6h | 50€/h | 300€ |

**Onglet 3 — Récapitulatif**
- Sous-total HT
- TVA (taux%)
- Total TTC
- Conditions de paiement
- Mentions légales

---

## 10. Évolutions futures (si passage en SaaS)

Si le projet évolue vers une application multi-utilisateurs, les changements principaux à prévoir sont :

- **Multi-tenancy** : ajouter `tenant_id` sur toutes les tables + Row-Level Security PostgreSQL
- **Auth robuste** : JWT access token (15 min) + refresh token (30 jours) avec rotation
- **Plans tarifaires** : intégrer Stripe Billing (Free / Pro / Business)
- **Gestion des rôles** : Admin, comptable, collaborateur par organisation
- **API Gateway** : rate limiting, routing par tenant
- **Infrastructure** : Docker + Kubernetes, autoscaling horizontal
- **Portail client** : lien sécurisé pour accepter/refuser le devis sans compte
- **Relances automatiques** : séquence email J+7, J+14, J+30

---

## 11. Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/facturation"

# Redis (optionnel pour les jobs)
REDIS_URL="redis://localhost:6379"

# Auth (session)
SESSION_SECRET="une-chaine-aleatoire-longue"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre@email.com"
SMTP_PASS="app-password"
EMAIL_FROM="Votre Nom <votre@email.com>"

# App
PORT=3000
NODE_ENV="development"
STORAGE_PATH="./storage"

# Cron
CRON_WEEKLY="0 20 * * 0"  # Dimanche 20h00
```

---

## 12. Commandes utiles

```bash
# Démarrer en développement
docker-compose up -d        # PostgreSQL + Redis
npm run dev                  # Backend + Frontend

# Base de données
npx prisma migrate dev       # Appliquer les migrations
npx prisma studio            # Interface graphique BDD
npx prisma db seed           # Insérer les données de test

# Générer les devis manuellement
curl -X POST http://localhost:3000/api/devis/generate/2025-W03

# Build production
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 13. Conventions de code

- **Langue** : code en anglais, commentaires et messages utilisateur en français
- **Nommage BDD** : `snake_case` pour les tables et colonnes
- **Nommage TypeScript** : `camelCase` pour les variables, `PascalCase` pour les types
- **Dates** : toujours stocker en UTC, afficher en heure locale (Europe/Paris)
- **Montants** : stocker en `NUMERIC(10,2)`, ne jamais utiliser `FLOAT` pour les montants
- **UUIDs** : utiliser `gen_random_uuid()` PostgreSQL (pas de UUID v1)
- **Erreurs** : toujours retourner `{ error: string, code: string }` avec le bon status HTTP

---

*Dernière mise à jour : avril 2025*
