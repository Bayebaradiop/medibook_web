# 📘 Documentation DevOps — MediBook Web

> Guide complet de la mise en place du pipeline CI/CD.
> Chaque outil est expliqué clairement avec son rôle, ses fichiers et sa configuration.

---

## 📋 Table des matières

1. [Vue d'ensemble du pipeline](#vue-densemble-du-pipeline)
2. [Docker — Containeriser l'application](#étape-1--docker--containeriser-lapplication)
3. [Jenkins — Pipeline CI/CD](#étape-2--jenkins--pipeline-cicd)
4. [SonarCloud — Qualité du code](#étape-3--sonarcloud--qualité-du-code)
5. [Trivy — Sécurité des images Docker](#étape-4--trivy--sécurité-des-images-docker)
6. [Docker Hub — Registry d'images](#étape-5--docker-hub--registry-dimages)
7. [Terraform — Infrastructure Azure](#étape-6--terraform--infrastructure-azure)
8. [Ansible — Déploiement automatisé](#étape-7--ansible--déploiement-automatisé)
9. [Prometheus & Grafana — Métriques](#étape-8--prometheus--grafana--métriques)

---

## Vue d'ensemble du pipeline

### Schéma complet

```
Code (Git/GitHub)
  │
  ▼
Jenkins (CI/CD) ──→ SonarCloud (Qualité) + Trivy (Sécurité Docker)
  │
  ▼
Docker (Build image)
  │
  ▼
Docker Hub (Stocke l'image)
  │
  ▼
Terraform (Provisionne l'infra Azure)
  │
  ▼
Ansible (Configure & déploie)
  │
  ▼
Azure App Service (Hébergement)
  │
  ▼
Prometheus + Grafana (Métriques)
```

### Informations du projet

| Élément | Valeur |
|---------|--------|
| **Frontend** | React + TypeScript + Vite |
| **Backend** | Spring Boot (Java 17) |
| **GitHub** | https://github.com/Bayebaradiop/medibook_web.git |
| **Branche** | `bara_dev` |
| **URL production** | https://medibook-web.azurewebsites.net |
| **URL backend** | https://medibook-app.ashyforest-850fd289.spaincentral.azurecontainerapps.io/api |

### Structure complète des fichiers DevOps

```
medibook_web/
├── Dockerfile                          ← Image Docker de l'app
├── Jenkinsfile                         ← Pipeline CI/CD (7 stages)
├── sonar-project.properties            ← Configuration SonarCloud
├── docker-compose.yml                  ← Lance Jenkins
├── docker-compose.monitoring.yml       ← Lance Prometheus + Grafana
├── jenkins/
│   └── Dockerfile                      ← Image Jenkins personnalisée
├── nginx/
│   └── default.conf                    ← Config serveur web Nginx
├── terraform/
│   ├── main.tf                         ← Ressources Azure à créer
│   ├── variables.tf                    ← Déclaration des variables
│   ├── terraform.tfvars                ← Valeurs (exclu de Git)
│   └── outputs.tf                      ← URL de l'app après création
├── ansible/
│   ├── ansible.cfg                     ← Configuration Ansible
│   ├── inventory.ini                   ← Liste des serveurs
│   └── playbook.yml                    ← Tâches de déploiement
└── monitoring/
    ├── prometheus.yml                  ← Config Prometheus (quoi scraper)
    └── grafana/
        ├── provisioning/
        │   ├── datasources/
        │   │   └── datasource.yml      ← Connecte Grafana à Prometheus
        │   └── dashboards/
        │       └── dashboard.yml       ← Charge les dashboards au démarrage
        └── dashboards/
            └── medibook-dashboard.json ← Dashboard avec 8 graphiques
```

---

## Étape 1 : Docker — Containeriser l'application

### C'est quoi ?

Docker met l'application dans une **boîte isolée** appelée **conteneur**. Cette boîte contient tout ce dont l'app a besoin (code compilé, serveur web Nginx). Elle fonctionne partout — sur ton PC, sur un serveur, sur Azure.

### Pourquoi ?

Sans Docker, il faudrait installer Node.js, compiler le code, configurer Nginx sur chaque serveur manuellement. Avec Docker, une seule commande suffit : `docker run`.

### Fichier : `Dockerfile`

```dockerfile
# ===== ÉTAPE 1 : CONSTRUIRE L'APPLICATION =====
# On part d'une image Node.js légère (alpine = version minimale de Linux)
FROM node:18-alpine AS build

# On se place dans le dossier /app à l'intérieur du conteneur
WORKDIR /app

# On copie d'abord package.json et package-lock.json
# (Docker met en cache les dépendances si ces fichiers ne changent pas)
COPY package.json package-lock.json ./

# On installe les dépendances (npm ci = installation propre basée sur le lock)
RUN npm ci

# On copie tout le reste du code source
COPY . .

# On construit l'application React (génère le dossier dist/)
RUN npm run build

# ===== ÉTAPE 2 : SERVIR L'APPLICATION =====
# On repart d'une image Nginx ultra-légère (serveur web)
FROM nginx:alpine

# On copie le résultat du build (dist/) dans le dossier web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# On copie notre config Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Le conteneur écoute sur le port 80
EXPOSE 80

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
```

**Pourquoi 2 étapes (multi-stage) ?**
L'étape Build contient Node.js + node_modules (~500 MB). L'étape Production ne garde que Nginx + les fichiers HTML/JS compilés (~30 MB). L'image finale est **16x plus légère** et plus sécurisée.

### Fichier : `nginx/default.conf`

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        # React est une SPA : toutes les routes sont gérées par index.html
        try_files $uri $uri/ /index.html;
    }

    # Cache les fichiers statiques pendant 1 an
    location /assets {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

`try_files` est essentiel : sans ça, quand un utilisateur accède à `/dashboard` directement, Nginx cherche un fichier `/dashboard` sur le disque, ne le trouve pas, et renvoie une erreur 404.

---

## Étape 2 : Jenkins — Pipeline CI/CD

### C'est quoi ?

Jenkins est un **serveur d'automatisation**. À chaque `git push`, Jenkins exécute automatiquement 7 étapes : installer les dépendances, tester, analyser la qualité, construire l'image Docker, scanner les vulnérabilités, et publier l'image.

### Pourquoi ?

Sans Jenkins, il faudrait exécuter manuellement `npm ci`, `npm test`, `docker build`, `docker push` à chaque modification. Jenkins automatise tout ça en un seul clic.

### Architecture : 3 fichiers collaborent

```
medibook_web/
├── jenkins/
│   └── Dockerfile          ← Image Jenkins avec Docker CLI + Trivy
├── docker-compose.yml      ← Lance Jenkins en conteneur
└── Jenkinsfile             ← Décrit les 7 étapes du pipeline
```

### Fichier : `jenkins/Dockerfile`

On crée une image Jenkins personnalisée car le pipeline a besoin de Docker CLI (pour construire des images) et Trivy (pour scanner les vulnérabilités) :

```dockerfile
FROM jenkins/jenkins:lts

USER root

# Docker CLI : permet à Jenkins de construire des images Docker
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# Trivy : scanner de vulnérabilités pour images Docker
RUN apt-get update && \
    apt-get install -y wget apt-transport-https gnupg lsb-release && \
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb bookworm main" > /etc/apt/sources.list.d/trivy.list && \
    apt-get update && \
    apt-get install -y trivy && \
    rm -rf /var/lib/apt/lists/*

USER root
```

### Fichier : `docker-compose.yml`

```yaml
services:
  jenkins:
    build: ./jenkins                    # Construit depuis jenkins/Dockerfile
    container_name: jenkins
    user: root                          # Nécessaire pour accéder au socket Docker
    ports:
      - "8087:8080"                     # Jenkins accessible sur http://localhost:8087
    volumes:
      - jenkins_home:/var/jenkins_home  # Données persistantes (jobs, plugins, configs)
      - /var/run/docker.sock:/var/run/docker.sock  # Permet à Jenkins d'utiliser Docker

volumes:
  jenkins_home:
    external: true
    name: medibook_web_jenkins_home
```

**`/var/run/docker.sock`** : c'est la technique "Docker-in-Docker". Jenkins (dans un conteneur) utilise le Docker de la machine hôte via ce socket.

### Fichier : `Jenkinsfile`

```groovy
pipeline {
    agent any

    // NodeJS installé via le plugin Jenkins
    tools {
        nodejs 'NodeJS-18'
    }

    // Variables disponibles dans tout le pipeline
    environment {
        DOCKER_IMAGE = 'bayebara01012000/medibook-web'
        DOCKER_TAG = "${BUILD_NUMBER}"    // Numéro auto-incrémenté (1, 2, 3...)
    }

    stages {
        // ── STAGE 1 : Récupérer le code depuis GitHub ──
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── STAGE 2 : Installer les dépendances npm ──
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        // ── STAGE 3 : Lancer les tests unitaires ──
        stage('Test') {
            steps {
                sh 'npm run test -- --run'
            }
        }

        // ── STAGE 4 : Analyse qualité sur SonarCloud ──
        stage('SonarCloud') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=medibook_web \
                          -Dsonar.organization=bayebaradiop \
                          -Dsonar.sources=src \
                          -Dsonar.host.url=https://sonarcloud.io
                    '''
                }
            }
        }

        // ── STAGE 5 : Construire l'image Docker ──
        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        // ── STAGE 6 : Scanner les vulnérabilités de l'image ──
        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ── STAGE 7 : Publier l'image sur Docker Hub ──
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
    }

    // Nettoyage après chaque build
    post {
        always {
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
        }
    }
}
```

### Configuration Jenkins (interface web http://localhost:8087)

**Plugins à installer :**
- NodeJS Plugin → permet d'utiliser `npm`
- SonarQube Scanner → connecte Jenkins à SonarCloud
- Docker Pipeline → support Docker dans les pipelines

**Tools :** `Manage Jenkins → Tools → NodeJS → Add` → Name: `NodeJS-18`

**SonarCloud :** `Manage Jenkins → System → SonarQube servers → Add` → Name: `SonarCloud`, URL: `https://sonarcloud.io`, Token: credential créé

**Credentials Docker Hub :** `Manage Jenkins → Credentials → Add` → Type: `Username with password`, ID: `dockerhub-credentials`

**Job Pipeline :** `New Item → Pipeline` → Git URL: `https://github.com/Bayebaradiop/medibook_web.git`, Branch: `bara_dev`, Script Path: `Jenkinsfile`

---

## Étape 3 : SonarCloud — Qualité du code

### C'est quoi ?

SonarCloud analyse automatiquement le code source pour détecter les bugs, vulnérabilités, code smells (mauvaises pratiques), et mesurer la couverture de tests.

### Pourquoi ?

Sans SonarCloud, les bugs et failles de sécurité passent inaperçus jusqu'à ce qu'un utilisateur les découvre en production.

### Fichier : `sonar-project.properties`

```properties
# Identifiant unique du projet sur SonarCloud
sonar.projectKey=medibook_web

# Organisation SonarCloud (ton compte)
sonar.organization=bayebaradiop

# Nom affiché sur le dashboard
sonar.projectName=medibook_web

# Dossier contenant le code à analyser
sonar.sources=src

# Fichiers exclus (tests, dépendances, fichiers compilés)
sonar.exclusions=**/test/**,**/*.test.ts,**/*.test.tsx,**/node_modules/**,**/dist/**

# URL du serveur SonarCloud
sonar.host.url=https://sonarcloud.io
```

### Comment ça s'intègre ?

SonarCloud est exécuté au **Stage 4** du pipeline Jenkins via `npx sonar-scanner`. Le token d'authentification est injecté par `withSonarQubeEnv('SonarCloud')`.

### Configuration

1. Créer un compte sur [sonarcloud.io](https://sonarcloud.io) avec GitHub
2. Importer le repo `medibook_web`
3. Générer un token : `My Account → Security → Generate Token`
4. Ajouter le token dans Jenkins comme credential `Secret text`

### Résultat

Dashboard accessible sur : `https://sonarcloud.io/project/overview?id=medibook_web`

---

## Étape 4 : Trivy — Sécurité des images Docker

### C'est quoi ?

Trivy est un scanner de vulnérabilités qui analyse une image Docker pour trouver des failles connues (CVE) dans le système d'exploitation, les paquets installés et les dépendances npm.

### Pourquoi ?

Une image Docker peut contenir des failles de sécurité dans ses dépendances sans que tu le saches. Trivy les détecte **avant** la publication sur Docker Hub.

### Comment ça s'intègre ?

Trivy est pré-installé dans l'image Jenkins (`jenkins/Dockerfile`) et exécuté au **Stage 6** du pipeline :

```groovy
stage('Trivy Scan') {
    steps {
        sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG}"
    }
}
```

| Option | Explication |
|--------|-------------|
| `--exit-code 0` | Le pipeline continue même si des vulnérabilités sont trouvées (mode informatif) |
| `--severity HIGH,CRITICAL` | Ne remonte que les failles sérieuses |

### Complémentarité avec SonarCloud

| SonarCloud | Trivy |
|-----------|-------|
| Analyse le **code** que tu écris | Analyse l'**image Docker** complète |
| Bugs, code smells, vulnérabilités du code | CVE dans l'OS, les paquets, les dépendances |

---

## Étape 5 : Docker Hub — Registry d'images

### C'est quoi ?

Docker Hub est un **magasin d'images Docker en ligne**. C'est là que Jenkins publie les images après le build, et c'est de là qu'Azure les télécharge pour le déploiement.

### Pourquoi ?

Sans registry, il faudrait copier manuellement les fichiers Docker sur chaque serveur. Avec Docker Hub, Azure fait un simple `docker pull` pour récupérer la dernière version.

### Comment ça s'intègre ?

Docker Hub intervient aux **Stages 5 et 7** du pipeline Jenkins :

- **Stage 5** : `docker build` crée l'image avec 2 tags (numéro de build + `latest`)
- **Stage 7** : `docker push` envoie l'image sur Docker Hub

Les identifiants Docker Hub sont stockés dans Jenkins Credentials (ID: `dockerhub-credentials`) et injectés via `withCredentials`.

### Notre image

```
hub.docker.com/r/bayebara01012000/medibook-web
```

| Tag | Exemple | Utilité |
|-----|---------|--------|
| `BUILD_NUMBER` | `:12` | Traçabilité (version précise) |
| `latest` | `:latest` | Toujours la dernière version stable |

---

## Étape 6 : Terraform — Infrastructure Azure

### C'est quoi ?

Terraform est un outil d'**Infrastructure as Code (IaC)**. Au lieu de créer des serveurs en cliquant dans le portail Azure, tu décris l'infrastructure dans des fichiers texte et Terraform crée tout automatiquement.

### Pourquoi ?

- **Reproductible** : `terraform apply` recrée la même infra en 1 commande
- **Versionné** : les fichiers `.tf` sont dans Git
- **Documenté** : le code EST la documentation de l'infra

### Fichiers

```
terraform/
├── main.tf            ← Ressources à créer (le cœur)
├── variables.tf       ← Déclaration des variables
├── terraform.tfvars   ← Valeurs des variables (EXCLU de Git)
└── outputs.tf         ← URL affichée après création
```

### Fichier : `terraform/main.tf`

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id            = var.subscription_id
  skip_provider_registration = true
}

# 1. Resource Group — "dossier" qui regroupe toutes les ressources
resource "azurerm_resource_group" "rg" {
  name     = "rg-medibook"
  location = "Germany West Central"
}

# 2. Service Plan — taille du serveur (F1 = gratuit)
resource "azurerm_service_plan" "plan" {
  name                = "plan-medibook"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "F1"
}

# 3. Web App — l'application qui fait tourner notre image Docker
resource "azurerm_linux_web_app" "app" {
  name                = "medibook-web"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    always_on = false    # F1 gratuit ne supporte pas always_on
    application_stack {
      docker_image_name = "bayebara01012000/medibook-web:latest"
    }
  }
}
```

### Fichier : `terraform/variables.tf`

```hcl
variable "subscription_id" {
  description = "ID de l'abonnement Azure"
  type        = string
}
```

### Fichier : `terraform/outputs.tf`

```hcl
output "app_url" {
  value = "https://${azurerm_linux_web_app.app.default_hostname}"
}
```

### Les commandes Terraform

```bash
az login                  # Se connecter à Azure
cd terraform
terraform init            # Télécharge le provider Azure (1 seule fois)
terraform plan            # Aperçu de ce qui va être créé
terraform apply           # Crée les ressources (tape "yes")
terraform destroy         # Supprime tout (si nécessaire)
```

### Hiérarchie des 3 ressources

```
Resource Group : rg-medibook (Germany West Central)
  └── Service Plan : plan-medibook (Linux, F1 gratuit)
      └── Web App : medibook-web
          Image: bayebara01012000/medibook-web:latest
          URL: https://medibook-web.azurewebsites.net
```

### Fichiers exclus de Git (`.gitignore`)

```
*.tfvars           # Contient l'ID d'abonnement Azure
.terraform/        # Cache du provider
*.tfstate          # État de l'infrastructure
*.tfstate.backup
```

---

## Étape 7 : Ansible — Déploiement automatisé

### C'est quoi ?

Ansible exécute des tâches automatisées sur des serveurs. Il met à jour l'image Docker sur Azure, redémarre l'app et vérifie qu'elle fonctionne.

### Pourquoi ?

**Terraform** crée l'infrastructure (une seule fois). **Ansible** déploie l'application (à chaque nouvelle version).

| | Terraform | Ansible |
|-|-----------|---------|
| **Rôle** | Créer l'infra | Déployer l'app |
| **Quand** | 1 fois | À chaque version |
| **Analogie** | Construire la maison | Aménager la maison |

### Fichiers

```
ansible/
├── ansible.cfg        ← Configuration générale
├── inventory.ini      ← Liste des serveurs
└── playbook.yml       ← Les tâches à exécuter
```

### Fichier : `ansible/playbook.yml`

```yaml
---
- name: Déployer medibook-web sur Azure App Service
  hosts: localhost
  connection: local

  tasks:
    # 1. Met à jour l'image Docker sur Azure
    - name: Mettre à jour l'image Docker sur Azure App Service
      shell: >
        az webapp config container set
        --name medibook-web
        --resource-group rg-medibook
        --docker-custom-image-name bayebara01012000/medibook-web:latest

    # 2. Redémarre l'application
    - name: Redémarrer l'App Service pour tirer la dernière image
      shell: az webapp restart --name medibook-web --resource-group rg-medibook

    # 3. Attend que l'app démarre
    - name: Attendre le redémarrage
      pause:
        seconds: 30

    # 4. Vérifie que l'app répond (5 tentatives, 15s entre chaque)
    - name: Vérifier que l'app répond
      uri:
        url: "https://medibook-web.azurewebsites.net"
        status_code: 200
        validate_certs: yes
      register: result
      retries: 5
      delay: 15
      until: result.status == 200

    # 5. Affiche la confirmation
    - name: Afficher le résultat
      debug:
        msg: "L'application est accessible sur https://medibook-web.azurewebsites.net (HTTP {{ result.status }})"
```

### Lancer le déploiement

```bash
az login
cd ansible
ansible-playbook playbook.yml
```

---

## Étape 8 : Prometheus & Grafana — Métriques

### C'est quoi ?

- **Prometheus** collecte des métriques chiffrées du backend (nombre de requêtes, latence, mémoire) toutes les 15 secondes
- **Grafana** affiche ces métriques dans des graphiques interactifs

### Pourquoi ?

Sans monitoring, tu ne sais pas si l'app est lente, si elle reçoit des erreurs 500, ou combien d'utilisateurs sont actifs — tant qu'un utilisateur ne te le signale pas.

### Fichier : `docker-compose.monitoring.yml` (partie Prometheus/Grafana)

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"                     # http://localhost:9090
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"                     # http://localhost:3001
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
```

### Fichier : `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s    # Collecte toutes les 15 secondes

scrape_configs:
  # Scrape le backend Spring Boot (métriques Actuator)
  - job_name: 'medibook-backend'
    metrics_path: /actuator/prometheus
    scheme: https
    static_configs:
      - targets: ['medibook-app.ashyforest-850fd289.spaincentral.azurecontainerapps.io']
        labels:
          app: 'medibook-api'

  # Prometheus scrape ses propres métriques
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

### Provisioning automatique

Grafana est pré-configuré au démarrage grâce à 3 fichiers :

- **`datasource.yml`** : connecte Grafana à Prometheus (`http://prometheus:9090`)
- **`dashboard.yml`** : charge les dashboards depuis des fichiers JSON
- **`medibook-dashboard.json`** : dashboard avec 8 panneaux (logins, users by role, RDV by status, HTTP latency, cabinets, active users, registrations, HTTP status codes)

### Le flux

```
Backend Spring Boot ──(scrape 15s)──→ Prometheus ──(requêtes)──→ Grafana
  /actuator/prometheus                  :9090                    :3001
```

---

## Récapitulatif

### Schéma complet du pipeline

```
git push (GitHub)
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  JENKINS (CI - Intégration Continue)                │
│                                                     │
│  1. Checkout   → Récupère le code depuis GitHub     │
│  2. Install    → npm ci (dépendances)               │
│  3. Test       → Vitest (tests unitaires)           │
│  4. SonarCloud → Analyse qualité du code            │
│  5. Docker     → Construit l'image conteneur        │
│  6. Trivy      → Scanne les vulnérabilités          │
│  7. Push       → Publie sur Docker Hub              │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (Terraform)                         │
│  Resource Group → Service Plan → Web App (Azure)    │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  DÉPLOIEMENT (Ansible)                              │
│  Met à jour l'image → Redémarre → Vérifie HTTP 200 │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  OBSERVABILITÉ                                      │
│                                                     │
│  📊 Métriques → Prometheus + Grafana (:9090/:3001)  │
└─────────────────────────────────────────────────────┘

      → https://medibook-web.azurewebsites.net ✅
```

### Tableau des outils

| Étape | Outil | Fichier clé | URL |
|-------|-------|-------------|-----|
| 1 | Docker | `Dockerfile` | - |
| 2 | Jenkins | `Jenkinsfile` | http://localhost:8087 |
| 3 | SonarCloud | `sonar-project.properties` | https://sonarcloud.io |
| 4 | Trivy | *(dans Jenkins)* | - |
| 5 | Docker Hub | *(dans Jenkins)* | https://hub.docker.com |
| 6 | Terraform | `terraform/main.tf` | https://portal.azure.com |
| 7 | Ansible | `ansible/playbook.yml` | - |
| 8 | Prometheus + Grafana | `docker-compose.monitoring.yml` | :9090 / :3001 |
