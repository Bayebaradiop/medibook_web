# Document de Soutenance — Outils DevOps MediBook Web

---

## Table des matières

1. [Docker](#1-docker--conteneurisation)
2. [Docker Compose](#2-docker-compose--orchestration-multi-conteneurs)
3. [Jenkins](#3-jenkins--intégration-et-déploiement-continus-cicd)
4. [Trivy](#4-trivy--scan-de-sécurité-des-conteneurs)
5. [SonarCloud](#5-sonarcloud--analyse-de-qualité-de-code)
6. [Terraform](#6-terraform--infrastructure-as-code-iac)
7. [Ansible](#7-ansible--automatisation-du-déploiement)
8. [Nginx](#8-nginx--serveur-web-et-reverse-proxy)
9. [Prometheus](#9-prometheus--collecte-de-métriques)
10. [Grafana](#10-grafana--visualisation-et-dashboards)
11. [Logstash (ELK Stack)](#11-logstash-elk-stack--agrégation-de-logs)
12. [Vitest](#12-vitest--tests-unitaires)
13. [Playwright](#13-playwright--tests-end-to-end-e2e)
14. [ESLint](#14-eslint--analyse-statique-du-code)
15. [Vite](#15-vite--outil-de-build-et-serveur-de-développement)
16. [Architecture CI/CD Globale](#architecture-cicd-globale)

---

## 1. Docker — Conteneurisation

### Description

Docker est une plateforme de conteneurisation qui permet d'empaqueter une application et toutes ses dépendances dans un conteneur léger, portable et isolé. Un conteneur Docker fonctionne de manière identique sur n'importe quel environnement (développement, test, production), éliminant ainsi le problème « ça marche sur ma machine ».

### Utilisation dans MediBook Web

Le projet utilise un **Dockerfile multi-stage** (construction en deux étapes) pour optimiser la taille de l'image finale :

**Étape 1 — Build :**
- Image de base : `node:18-alpine`
- Installation des dépendances avec `npm ci`
- Compilation de l'application React → dossier `dist/`
- Taille intermédiaire : ~500 Mo

**Étape 2 — Production :**
- Image de base : `nginx:alpine`
- Copie uniquement des fichiers compilés (`dist/`) dans Nginx
- Taille finale : ~30 Mo (16x plus petite)
- Suppression complète des outils de build → image plus sécurisée

```dockerfile
# Étape 1 : Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Pourquoi Docker ?

| Avantage | Description |
|---|---|
| **Portabilité** | Le même conteneur fonctionne partout : local, serveur, cloud |
| **Isolation** | Chaque conteneur a son propre système de fichiers et ses propres processus |
| **Légèreté** | Partage le noyau de l'hôte, contrairement aux machines virtuelles |
| **Reproductibilité** | Le build est déterministe grâce au Dockerfile |
| **Sécurité** | Le multi-stage élimine les outils de développement de l'image finale |

---

## 2. Docker Compose — Orchestration multi-conteneurs

### Description

Docker Compose est un outil qui permet de définir et exécuter des applications multi-conteneurs à l'aide d'un fichier YAML. Il orchestre le démarrage, la mise en réseau et les volumes de plusieurs services en une seule commande (`docker compose up`).

### Utilisation dans MediBook Web

Le projet utilise **3 fichiers Docker Compose** pour séparer les environnements :

#### a) `docker-compose.yml` — Environnement Jenkins (CI/CD)

```yaml
services:
  jenkins:
    build: ./jenkins
    container_name: jenkins
    user: root
    ports:
      - "8087:8080"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
```

- Jenkins accessible sur le port **8087**
- Docker-in-Docker via le montage du socket Docker
- Volume persistant pour conserver les configurations Jenkins

#### b) `docker-compose.prod.yml` — Environnement de production

```yaml
services:
  medibook-web:
    image: bayebara01012000/medibook-web:latest
    container_name: medibook-web
    restart: unless-stopped
    ports:
      - "3000:80"

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - medibook-web
```

- Application servie via Nginx reverse proxy
- Redémarrage automatique en cas de crash (`unless-stopped`)

#### c) `docker-compose.monitoring.yml` — Stack de monitoring

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
```

- Prometheus sur le port **9090** (collecte de métriques)
- Grafana sur le port **3001** (visualisation)
- Auto-provisioning des dashboards et datasources

---

## 3. Jenkins — Intégration et Déploiement Continus (CI/CD)

### Description

Jenkins est un serveur d'automatisation open-source qui permet de construire, tester et déployer du code de manière continue. Il exécute des pipelines définis dans un fichier `Jenkinsfile` à chaque push sur le repository Git.

### Utilisation dans MediBook Web

Le projet utilise une image Jenkins **personnalisée** (avec Docker CLI et Trivy installés) et un pipeline en **7 étapes** :

#### Image Jenkins personnalisée

```dockerfile
FROM jenkins/jenkins:lts
USER root
# Docker CLI pour builder/pusher des images
RUN apt-get update && apt-get install -y docker.io
# Trivy pour le scan de vulnérabilités
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb bookworm main" > /etc/apt/sources.list.d/trivy.list && \
    apt-get update && apt-get install -y trivy
```

#### Pipeline CI/CD — 7 étapes

| Étape | Nom | Action | Outil |
|---|---|---|---|
| 1 | **Checkout** | Récupération du code source depuis GitHub | Git |
| 2 | **Install** | Installation des dépendances (`npm ci`) | Node.js 18 |
| 3 | **Test** | Exécution des tests unitaires | Vitest |
| 4 | **SonarCloud** | Analyse de la qualité du code | SonarScanner |
| 5 | **Docker Build** | Construction de l'image Docker (multi-stage) | Docker |
| 6 | **Trivy Scan** | Scan de sécurité de l'image (HIGH, CRITICAL) | Trivy |
| 7 | **Docker Push** | Publication de l'image sur Docker Hub | Docker Hub |

```groovy
pipeline {
    agent any
    tools { nodejs 'NodeJS-18' }
    environment {
        DOCKER_IMAGE = 'bayebara01012000/medibook-web'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Checkout')    { steps { checkout scm } }
        stage('Install')     { steps { sh 'npm ci' } }
        stage('Test')        { steps { sh 'npm run test -- --run' } }
        stage('SonarCloud')  { steps {
            withSonarQubeEnv('SonarCloud') {
                sh 'npx sonar-scanner -Dsonar.projectKey=medibook_web ...'
            }
        }}
        stage('Docker Build') { steps {
            sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
        }}
        stage('Trivy Scan')  { steps {
            sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG}"
        }}
        stage('Docker Push') { steps {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', ...)]) {
                sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG} && docker push ${DOCKER_IMAGE}:latest'
            }
        }}
    }
    post { always { sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true" } }
}
```

**Post-pipeline :** Nettoyage automatique de l'image locale pour libérer l'espace disque.

---

## 4. Trivy — Scan de sécurité des conteneurs

### Description

Trivy est un scanner de vulnérabilités open-source développé par Aqua Security. Il analyse les images Docker pour détecter les failles de sécurité connues (CVE) dans les packages système et les dépendances de l'application.

### Utilisation dans MediBook Web

Trivy est intégré directement dans le pipeline Jenkins (étape 6) :

```bash
trivy image --exit-code 0 --severity HIGH,CRITICAL bayebara01012000/medibook-web:latest
```

| Paramètre | Valeur | Signification |
|---|---|---|
| `--exit-code 0` | 0 | Ne bloque pas le pipeline même si des vulnérabilités sont trouvées (mode avertissement) |
| `--severity` | HIGH,CRITICAL | Ne rapporte que les vulnérabilités de niveau élevé ou critique |

### Pourquoi Trivy ?

- **Détection précoce** des failles de sécurité avant le déploiement
- **Base de données CVE** mise à jour automatiquement
- **Rapide** : scan complet en quelques secondes
- **Intégration CI/CD** native avec Jenkins

---

## 5. SonarCloud — Analyse de qualité de code

### Description

SonarCloud est une plateforme cloud d'analyse statique du code source. Elle détecte automatiquement les bugs, les vulnérabilités de sécurité, les code smells (mauvaises pratiques) et mesure la couverture de tests.

### Utilisation dans MediBook Web

Configuration dans `sonar-project.properties` :

```properties
sonar.projectKey=medibook_web
sonar.organization=bayebaradiop
sonar.projectName=medibook_web
sonar.sources=src
sonar.exclusions=**/test/**,**/*.test.ts,**/*.test.tsx,**/node_modules/**,**/dist/**
sonar.host.url=https://sonarcloud.io
```

| Paramètre | Description |
|---|---|
| `sonar.sources=src` | Analyse uniquement le dossier `src/` |
| `sonar.exclusions` | Exclut les fichiers de test, `node_modules` et `dist` |
| `sonar.host.url` | Hébergé sur SonarCloud (pas d'infrastructure locale) |

### Métriques analysées

- **Bugs** : erreurs logiques dans le code
- **Vulnérabilités** : failles de sécurité potentielles
- **Code Smells** : code difficile à maintenir
- **Duplications** : code copié-collé
- **Couverture de tests** : % du code couvert par les tests

---

## 6. Terraform — Infrastructure as Code (IaC)

### Description

Terraform est un outil d'Infrastructure as Code (IaC) développé par HashiCorp. Il permet de définir, provisionner et gérer l'infrastructure cloud de manière déclarative à travers des fichiers de configuration `.tf`. L'infrastructure est versionnée, reproductible et peut être détruite et recréée à l'identique.

### Utilisation dans MediBook Web

Terraform provisionne l'infrastructure sur **Microsoft Azure** :

#### Architecture Azure déployée

```
Azure (Germany West Central)
├── Resource Group : rg-medibook
│   ├── Service Plan : plan-medibook (F1 - Gratuit, Linux)
│   └── App Service : medibook-web
│       └── Image Docker : bayebara01012000/medibook-web:latest
└── URL : https://medibook-web.azurewebsites.net
```

#### Fichiers Terraform

| Fichier | Rôle |
|---|---|
| `main.tf` | Définition des ressources Azure (Resource Group, Service Plan, App Service) |
| `variables.tf` | Déclaration des variables d'entrée (subscription_id) |
| `outputs.tf` | Affichage de l'URL de l'application déployée |
| `terraform.tfvars` | Valeurs des variables |
| `.terraform.lock.hcl` | Verrouillage des versions des providers |
| `terraform.tfstate` | État actuel de l'infrastructure déployée |

#### Ressources provisionnées

```hcl
# 1. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "rg-medibook"
  location = "Germany West Central"
}

# 2. Service Plan (gratuit F1)
resource "azurerm_service_plan" "plan" {
  name     = "plan-medibook"
  os_type  = "Linux"
  sku_name = "F1"
}

# 3. App Service (conteneur Docker)
resource "azurerm_linux_web_app" "app" {
  name = "medibook-web"
  site_config {
    application_stack {
      docker_image_name = "bayebara01012000/medibook-web:latest"
    }
  }
}
```

### Commandes Terraform utilisées

| Commande | Description |
|---|---|
| `terraform init` | Initialisation du projet et téléchargement des providers |
| `terraform plan` | Aperçu des changements à appliquer |
| `terraform apply` | Création/mise à jour de l'infrastructure |
| `terraform destroy` | Suppression complète de l'infrastructure |

---

## 7. Ansible — Automatisation du déploiement

### Description

Ansible est un outil d'automatisation IT qui permet d'exécuter des tâches de configuration et de déploiement sur des serveurs distants, sans nécessiter d'agent installé sur les machines cibles. Il utilise des **playbooks** écrits en YAML pour décrire les étapes de déploiement.

### Utilisation dans MediBook Web

Ansible automatise le **déploiement sur Azure App Service** en 4 étapes :

#### Inventaire (`inventory.ini`)

```ini
[azure_app]
medibook-web.azurewebsites.net
```

#### Playbook de déploiement (`playbook.yml`)

| Étape | Tâche | Commande |
|---|---|---|
| 1 | **Mise à jour de l'image Docker** | `az webapp config container set --docker-custom-image-name bayebara01012000/medibook-web:latest` |
| 2 | **Redémarrage de l'App Service** | `az webapp restart --name medibook-web --resource-group rg-medibook` |
| 3 | **Attente** | Pause de 30 secondes |
| 4 | **Vérification de santé** | HTTP GET sur l'URL → attend un status 200 (5 tentatives, 15s d'intervalle) |

```yaml
- name: Déployer medibook-web sur Azure App Service
  hosts: localhost
  connection: local
  tasks:
    - name: Mettre à jour l'image Docker
      shell: >
        az webapp config container set --name medibook-web
        --resource-group rg-medibook
        --docker-custom-image-name bayebara01012000/medibook-web:latest

    - name: Redémarrer l'App Service
      shell: az webapp restart --name medibook-web --resource-group rg-medibook

    - name: Attendre le redémarrage
      pause:
        seconds: 30

    - name: Vérifier que l'app répond
      uri:
        url: "https://medibook-web.azurewebsites.net"
        status_code: 200
      retries: 5
      delay: 15
      until: result.status == 200
```

---

## 8. Nginx — Serveur Web et Reverse Proxy

### Description

Nginx est un serveur web haute performance qui sert également de reverse proxy et d'équilibreur de charge. Dans le contexte de MediBook Web, il joue un double rôle : servir les fichiers statiques de l'application React et gérer le routage côté client (SPA).

### Utilisation dans MediBook Web

#### Configuration (`nginx/default.conf`)

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React SPA : toutes les routes retournent index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des fichiers statiques (1 an)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

| Fonctionnalité | Description |
|---|---|
| **SPA Routing** | `try_files` redirige toutes les routes vers `index.html` pour que React Router gère la navigation |
| **Cache statique** | Les fichiers JS, CSS, images sont mis en cache pendant **1 an** côté client |
| **Performance** | En-tête `Cache-Control: public, immutable` pour éviter les re-validations inutiles |

---

## 9. Prometheus — Collecte de métriques

### Description

Prometheus est un système de monitoring et d'alerte open-source. Il collecte des métriques numériques à intervalles réguliers en « scrapant » des endpoints HTTP exposés par les applications. Les données sont stockées dans une base de données temporelle (time-series).

### Utilisation dans MediBook Web

#### Configuration (`monitoring/prometheus.yml`)

```yaml
global:
  scrape_interval: 15s  # Collecte toutes les 15 secondes

scrape_configs:
  - job_name: 'medibook-backend'
    metrics_path: /actuator/prometheus
    scheme: https
    static_configs:
      - targets: ['medibook-app.ashyforest-850fd289.spaincentral.azurecontainerapps.io']
        labels:
          app: 'medibook-api'

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

| Paramètre | Valeur | Description |
|---|---|---|
| `scrape_interval` | 15s | Fréquence de collecte des métriques |
| `metrics_path` | `/actuator/prometheus` | Endpoint Spring Boot Actuator exposant les métriques |
| `scheme` | https | Communication sécurisée |
| `targets` | Azure Container Apps | Adresse du backend Spring Boot |

### Métriques collectées

- Requêtes HTTP (nombre, latence, codes de status)
- Logins (succès/échecs)
- Nombre d'utilisateurs par rôle
- Rendez-vous par statut
- Cabinets, utilisateurs actifs, inscriptions
- Événements de rendez-vous

---

## 10. Grafana — Visualisation et Dashboards

### Description

Grafana est une plateforme open-source de visualisation de données et de monitoring. Elle se connecte à des sources de données comme Prometheus pour créer des dashboards interactifs en temps réel avec des graphiques, jauges, camemberts et alertes.

### Utilisation dans MediBook Web

#### Dashboard MediBook — 9 panneaux

| Panneau | Type | Métrique Prometheus | Description |
|---|---|---|---|
| **Logins (succès vs échecs)** | Timeseries | `rate(medibook_auth_logins_total[5m])` | Taux de connexions réussies et échouées sur 5 min |
| **Utilisateurs par rôle** | Bar gauge | `medibook_users_total` | Nombre d'utilisateurs par rôle (ADMIN, MEDECIN, PATIENT) |
| **Rendez-vous par statut** | Pie chart | `medibook_rendezvous_total` | Répartition des RDV (EN_ATTENTE, CONFIRME, ANNULE) |
| **Latence HTTP (p95)** | Timeseries | `histogram_quantile(0.95, ...)` | 95e percentile du temps de réponse des requêtes HTTP |
| **Cabinets** | Stat | `medibook_cabinets_total` | Nombre total de cabinets médicaux |
| **Utilisateurs actifs** | Stat | `sum(medibook_active_users_total)` | Nombre d'utilisateurs actuellement connectés |
| **Inscriptions** | Timeseries | `rate(medibook_auth_registrations_total[5m])` | Taux d'inscription de nouveaux utilisateurs |
| **Événements RDV** | Timeseries | `rate(medibook_rendezvous_events_total[5m])` | Taux de création/modification de rendez-vous |
| **HTTP Status Codes** | Timeseries | `http_server_requests_seconds_count` | Distribution des codes de réponse HTTP (200, 400, 500…) |

#### Auto-provisioning

Grafana est configuré pour charger automatiquement :
- **Datasource** : Prometheus (`http://prometheus:9090`)
- **Dashboards** : depuis le dossier `/var/lib/grafana/dashboards`

---

## 11. Logstash (ELK Stack) — Agrégation de logs

### Description

Logstash fait partie de la stack ELK (Elasticsearch, Logstash, Kibana). C'est un pipeline de traitement de données qui ingère des logs depuis diverses sources, les transforme et les envoie vers un système de stockage comme Elasticsearch pour l'analyse et la recherche.

### Utilisation dans MediBook Web

#### Configuration (`monitoring/logstash.conf`)

```conf
input {
  beats {
    port => 5044
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "medibook-logs-%{+YYYY.MM.dd}"
  }
}
```

| Composant | Description |
|---|---|
| **Input** | Réception des logs depuis Filebeat sur le port **5044** |
| **Output** | Envoi vers Elasticsearch sur le port **9200** |
| **Index** | Un index par jour : `medibook-logs-2026.04.13` |

---

## 12. Vitest — Tests unitaires

### Description

Vitest est un framework de tests unitaires ultra-rapide, conçu spécifiquement pour les projets utilisant Vite. Il offre une compatibilité avec l'API de Jest tout en bénéficiant de la vitesse de transformation de Vite (ESBuild/SWC).

### Utilisation dans MediBook Web

#### Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
```

| Paramètre | Valeur | Description |
|---|---|---|
| `environment` | jsdom | Simule un navigateur pour tester les composants React |
| `globals` | true | `describe`, `it`, `expect` disponibles sans import |
| `setupFiles` | `src/test/setup.ts` | Fichier de configuration exécuté avant chaque suite de tests |
| `include` | `*.test.ts`, `*.spec.tsx` | Convention de nommage des fichiers de test |

### Intégration CI/CD

Les tests sont exécutés automatiquement dans le pipeline Jenkins (étape 3) :
```bash
npm run test -- --run
```

---

## 13. Playwright — Tests End-to-End (E2E)

### Description

Playwright est un framework de tests E2E développé par Microsoft. Il permet d'automatiser les interactions avec un navigateur réel (Chrome, Firefox, Safari) pour tester l'application du point de vue de l'utilisateur final : navigation, clics, formulaires, etc.

### Utilisation dans MediBook Web

Le projet utilise Playwright via le framework Lovable pour les tests d'intégration et E2E :

```typescript
// playwright.config.ts
import { createLovableConfig } from "lovable-agent-playwright-config/config";
export default createLovableConfig({});

// playwright-fixture.ts
export { test, expect } from "lovable-agent-playwright-config/fixture";
```

---

## 14. ESLint — Analyse statique du code

### Description

ESLint est un outil d'analyse statique du code JavaScript/TypeScript. Il détecte les erreurs de syntaxe, les mauvaises pratiques et enforce un style de code cohérent dans toute l'équipe. Les règles sont configurables et extensibles via des plugins.

### Utilisation dans MediBook Web

#### Configuration (`eslint.config.js`)

```javascript
export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
```

| Plugin | Fonction |
|---|---|
| `typescript-eslint` | Règles spécifiques TypeScript |
| `react-hooks` | Vérifie les règles des hooks React (ordre d'appel, dépendances) |
| `react-refresh` | Vérifie la compatibilité avec le Hot Module Replacement (HMR) |

---

## 15. Vite — Outil de build et serveur de développement

### Description

Vite est un outil de build nouvelle génération pour les applications web modernes. Il utilise ESBuild pour le pré-bundling des dépendances et Rollup pour le bundling de production, offrant un démarrage quasi-instantané et un rechargement à chaud (HMR) ultra-rapide.

### Utilisation dans MediBook Web

#### Configuration (`vite.config.ts`)

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
```

| Fonctionnalité | Description |
|---|---|
| **Serveur dev** | Port 8080, support IPv6 |
| **HMR** | Rechargement à chaud sans perte d'état |
| **React SWC** | Transpilation ultra-rapide via SWC (alternative à Babel) |
| **Path alias** | `@/components` → `./src/components` |

---

## Architecture CI/CD Globale

Voici le flux complet du code au déploiement en production :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE CI/CD MEDIBOOK WEB                         │
└─────────────────────────────────────────────────────────────────────────────┘

  DÉVELOPPEMENT                  CI (Jenkins)                    CD (Ansible)
  ─────────────                  ────────────                    ────────────
  
  ┌──────────┐    git push     ┌─────────────┐                ┌──────────────┐
  │  Code    │ ──────────────► │  Checkout    │                │  Update      │
  │  React   │                 │  (GitHub)    │                │  Image Azure │
  │  + TS    │                 └──────┬───────┘                └──────┬───────┘
  └──────────┘                        │                               │
                               ┌──────▼───────┐                ┌──────▼───────┐
  ┌──────────┐                 │  npm ci       │                │  Restart     │
  │  ESLint  │                 │  (Install)    │                │  App Service │
  │  (Lint)  │                 └──────┬───────┘                └──────┬───────┘
  └──────────┘                        │                               │
                               ┌──────▼───────┐                ┌──────▼───────┐
  ┌──────────┐                 │  Vitest      │                │  Health      │
  │  Vite    │                 │  (Tests)     │                │  Check       │
  │  (Dev)   │                 └──────┬───────┘                │  (HTTP 200)  │
  └──────────┘                        │                        └──────────────┘
                               ┌──────▼───────┐
                               │  SonarCloud  │       MONITORING
                               │  (Qualité)   │       ──────────
                               └──────┬───────┘
                                      │                ┌──────────────┐
                               ┌──────▼───────┐        │  Prometheus  │
                               │  Docker      │        │  (Métriques) │
                               │  Build       │        └──────┬───────┘
                               └──────┬───────┘               │
                                      │                ┌──────▼───────┐
                               ┌──────▼───────┐        │  Grafana     │
                               │  Trivy       │        │  (Dashboard) │
                               │  (Sécurité)  │        └──────────────┘
                               └──────┬───────┘
                                      │                ┌──────────────┐
                               ┌──────▼───────┐        │  Logstash    │
                               │  Docker Hub  │        │  (Logs)      │
                               │  (Push)      │        └──────────────┘
                               └──────────────┘

  INFRASTRUCTURE (Terraform + Azure)
  ──────────────────────────────────
  ┌────────────────────────────────────────────────────┐
  │  Azure (Germany West Central)                       │
  │  ├── Resource Group : rg-medibook                   │
  │  ├── Service Plan : F1 (Gratuit, Linux)            │
  │  └── App Service : medibook-web                     │
  │      └── https://medibook-web.azurewebsites.net    │
  └────────────────────────────────────────────────────┘
```

### Résumé des outils DevOps

| Outil | Catégorie | Rôle dans MediBook |
|---|---|---|
| **Docker** | Conteneurisation | Packaging de l'application en image légère (~30 Mo) |
| **Docker Compose** | Orchestration | Gestion des environnements multi-conteneurs |
| **Jenkins** | CI/CD | Pipeline automatisé en 7 étapes |
| **Trivy** | Sécurité | Scan de vulnérabilités des images Docker |
| **SonarCloud** | Qualité | Analyse statique du code (bugs, vulnérabilités, code smells) |
| **Terraform** | IaC | Provisionnement de l'infrastructure Azure |
| **Ansible** | Déploiement | Automatisation du déploiement sur Azure App Service |
| **Nginx** | Serveur Web | Reverse proxy + cache statique + SPA routing |
| **Prometheus** | Monitoring | Collecte de métriques backend toutes les 15 secondes |
| **Grafana** | Visualisation | 9 dashboards temps réel (logins, RDV, latence, etc.) |
| **Logstash** | Logs | Agrégation des logs vers Elasticsearch |
| **Vitest** | Tests unitaires | Tests des composants React dans un environnement jsdom |
| **Playwright** | Tests E2E | Tests automatisés dans un navigateur réel |
| **ESLint** | Linting | Détection d'erreurs et enforcement du style de code |
| **Vite** | Build | Serveur de développement + bundling de production |
