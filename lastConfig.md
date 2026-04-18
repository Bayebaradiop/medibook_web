# Configuration complète du déploiement MediBook Web

> Guide étape par étape pour configurer un pipeline CI/CD complet :
> du code source jusqu'au déploiement automatique sur Azure.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

| Outil | Commande de vérification | À quoi ça sert |
|-------|--------------------------|----------------|
| Docker | `docker --version` | Conteneuriser l'application et Jenkins |
| Docker Compose | `docker compose version` | Orchestrer les containers |
| Git | `git --version` | Versionner le code |
| Node.js 18+ | `node --version` | Développer l'application React |
| Azure CLI | `az --version` | Se connecter à Azure |

---

## ÉTAPE 1 — Créer le projet et initialiser Git

**Ça sert à quoi ?** Préparer le projet avec le versioning. Git permet de suivre chaque modification du code et de collaborer en équipe.

```bash
# Cloner le projet
git clone <URL_DU_REPO>
cd medibook_web

# Créer votre branche de travail
git checkout -b votre_branche

# Vérifier le statut
git status
```

---

## ÉTAPE 2 — Créer le Dockerfile de l'application

**Ça sert à quoi ?** Le Dockerfile décrit comment construire une image Docker de notre application. L'image contient tout ce qu'il faut pour faire tourner l'app (code compilé + serveur web Nginx). On utilise un **multi-stage build** : une étape pour compiler, une autre pour servir — ce qui donne une image finale légère.

Créer le fichier `Dockerfile` à la racine du projet :

```dockerfile
# ===== ÉTAPE 1 : BUILD =====
# On part d'une image Node.js pour compiler le code React
FROM node:18-alpine AS build
WORKDIR /app

# On copie d'abord package.json pour profiter du cache Docker
COPY package.json package-lock.json ./
RUN npm ci

# On copie le reste du code et on compile
COPY . .
RUN npm run build

# ===== ÉTAPE 2 : PRODUCTION =====
# On prend une image Nginx légère pour servir les fichiers compilés
FROM nginx:alpine

# On copie les fichiers compilés (dossier dist/) dans Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# On copie notre configuration Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Résumé** :
- `FROM node:18-alpine AS build` → image temporaire pour compiler
- `npm ci` → installe les dépendances exactes
- `npm run build` → compile React en fichiers statiques (HTML/CSS/JS)
- `FROM nginx:alpine` → image finale légère (~40 Mo)
- Le résultat : une image Docker prête à être déployée

---

## ÉTAPE 3 — Configurer Nginx

**Ça sert à quoi ?** Nginx est le serveur web qui va servir notre application React. La configuration personnalisée est nécessaire pour que le routage React (SPA) fonctionne correctement — sinon, rafraîchir une page comme `/patients` donnerait une erreur 404.

Créer le dossier et le fichier `nginx/default.conf` :

```bash
mkdir -p nginx
```

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

**Résumé** :
- `try_files $uri $uri/ /index.html` → si le fichier n'existe pas, on renvoie `index.html` (React gère le routage côté client)
- `expires 1y` → les fichiers statiques sont mis en cache 1 an (performance)

---

## ÉTAPE 4 — Créer le Dockerfile Jenkins personnalisé

**Ça sert à quoi ?** On crée une image Jenkins qui contient tous les outils nécessaires : Docker (pour construire des images), Trivy (scan sécurité), Terraform (infrastructure Azure), Ansible (déploiement) et Azure CLI (connexion Azure). Sans ces outils, Jenkins ne pourrait pas exécuter notre pipeline.

Créer le dossier et le fichier `jenkins/Dockerfile` :

```bash
mkdir -p jenkins
```

```dockerfile
FROM jenkins/jenkins:lts

USER root

# ---- Docker CLI ----
# Permet à Jenkins de construire et pousser des images Docker
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# ---- Trivy ----
# Scanner de vulnérabilités pour les images Docker
RUN apt-get update && \
    apt-get install -y wget apt-transport-https gnupg lsb-release && \
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb bookworm main" > /etc/apt/sources.list.d/trivy.list && \
    apt-get update && \
    apt-get install -y trivy && \
    rm -rf /var/lib/apt/lists/*

# ---- Terraform ----
# Outil d'Infrastructure as Code pour créer les ressources Azure
RUN apt-get update && \
    apt-get install -y unzip && \
    wget -q https://releases.hashicorp.com/terraform/1.7.5/terraform_1.7.5_linux_amd64.zip -O /tmp/terraform.zip && \
    unzip /tmp/terraform.zip -d /usr/local/bin/ && \
    rm /tmp/terraform.zip && \
    rm -rf /var/lib/apt/lists/*

# ---- Ansible ----
# Outil d'automatisation pour le déploiement
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --break-system-packages ansible && \
    rm -rf /var/lib/apt/lists/*

# ---- Azure CLI ----
# Pour se connecter et interagir avec Azure
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

USER root
```

**Résumé** : Jenkins aura 5 outils intégrés :
| Outil | Rôle dans le pipeline |
|-------|----------------------|
| Docker CLI | Construire et pousser l'image Docker |
| Trivy | Scanner les vulnérabilités de sécurité |
| Terraform | Créer/gérer l'infrastructure Azure |
| Ansible | Déployer l'application sur Azure |
| Azure CLI | S'authentifier à Azure |

---

## ÉTAPE 5 — Créer le docker-compose.yml pour Jenkins

**Ça sert à quoi ?** Docker Compose simplifie le lancement de Jenkins. Au lieu d'une longue commande `docker run`, on décrit tout dans un fichier YAML. Le volume `/var/run/docker.sock` permet à Jenkins d'utiliser le Docker de la machine hôte (Docker-in-Docker).

Créer le fichier `docker-compose.yml` :

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

volumes:
  jenkins_home:
    external: true
    name: medibook_web_jenkins_home
```

**Résumé** :
- `build: ./jenkins` → construit l'image depuis `jenkins/Dockerfile`
- `ports: "8087:8080"` → Jenkins sera accessible sur `http://localhost:8087`
- `jenkins_home` → volume persistant pour ne pas perdre la config Jenkins
- `/var/run/docker.sock` → Jenkins peut lancer des commandes Docker

---

## ÉTAPE 6 — Lancer Jenkins pour la première fois

**Ça sert à quoi ?** Démarrer Jenkins et récupérer le mot de passe initial pour accéder à l'interface web.

```bash
# Créer le volume persistant
docker volume create medibook_web_jenkins_home

# Construire l'image Jenkins personnalisée
docker compose build jenkins

# Lancer Jenkins
docker compose up -d jenkins

# Récupérer le mot de passe initial (attendre ~30 secondes)
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Ensuite dans le navigateur** :
1. Ouvrir `http://localhost:8087`
2. Coller le mot de passe initial
3. Cliquer **Install suggested plugins** (attendre l'installation)
4. Créer votre compte administrateur
5. Valider l'URL Jenkins

**Résumé** : Jenkins est maintenant accessible et prêt à être configuré

---

## ÉTAPE 7 — Vérifier les outils dans Jenkins

**Ça sert à quoi ?** S'assurer que tous les outils (Docker, Terraform, Ansible, Azure CLI, Trivy) sont bien installés dans le container Jenkins avant de créer le pipeline.

```bash
docker exec jenkins docker --version
docker exec jenkins terraform --version
docker exec jenkins ansible --version
docker exec jenkins az --version
docker exec jenkins trivy --version
```

**Si une commande échoue** → il faut rebuilder l'image :
```bash
docker compose build --no-cache jenkins
docker compose up -d jenkins
```

---

## ÉTAPE 8 — Installer les plugins Jenkins nécessaires

**Ça sert à quoi ?** Les plugins ajoutent des fonctionnalités à Jenkins. On a besoin de NodeJS pour compiler l'app, Docker Pipeline pour manipuler les images, SonarQube pour l'analyse de code, et Azure Credentials pour stocker les identifiants Azure.

Dans Jenkins (`http://localhost:8087`) :

1. **Manage Jenkins** → **Plugins** → **Available plugins**
2. Rechercher et installer ces plugins :

| Plugin | À quoi ça sert |
|--------|---------------|
| `NodeJS` | Permet d'utiliser `npm` dans le pipeline |
| `Docker Pipeline` | Permet de construire/pousser des images Docker |
| `SonarQube Scanner` | Permet l'analyse de qualité du code |
| `Azure Credentials` | Permet de stocker les identifiants Azure de façon sécurisée |

3. Cliquer **Install** puis **Restart Jenkins**

---

## ÉTAPE 9 — Configurer NodeJS dans Jenkins

**Ça sert à quoi ?** Le pipeline a besoin de Node.js pour exécuter `npm ci` (installation des dépendances) et `npm run build` (compilation). On configure Jenkins pour qu'il installe automatiquement Node.js 18.

1. **Manage Jenkins** → **Tools**
2. Section **NodeJS** → **Add NodeJS**
3. Remplir :
   - **Name** : `NodeJS-18` (exactement ce nom, il est référencé dans le Jenkinsfile)
   - **Version** : `18.x`
   - Cocher **Install automatically**
4. **Save**

---

## ÉTAPE 10 — Configurer SonarCloud dans Jenkins

**Ça sert à quoi ?** SonarCloud analyse la qualité du code (bugs, code smells, couverture de tests). Jenkins envoie le code à SonarCloud pour analyse à chaque build.

### 10.1 — Créer un compte SonarCloud

1. Aller sur [https://sonarcloud.io](https://sonarcloud.io)
2. Se connecter avec GitHub
3. Créer une organisation (ex: `bayebaradiop`)
4. Créer un projet (ex: `medibook_web`)
5. Dans **My Account** → **Security** → **Generate Token**
6. **Copier le token**

### 10.2 — Ajouter le token dans Jenkins

1. **Manage Jenkins** → **Credentials** → **(global)** → **Add Credentials**
2. **Kind** : `Secret text`
3. **Secret** : coller le token SonarCloud
4. **ID** : `sonarcloud-token`
5. **Save**

### 10.3 — Configurer SonarQube dans Jenkins

1. **Manage Jenkins** → **System** → section **SonarQube servers**
2. Cliquer **Add SonarQube**
3. Remplir :
   - **Name** : `SonarCloud` (exactement ce nom)
   - **Server URL** : `https://sonarcloud.io`
   - **Server authentication token** : choisir `sonarcloud-token`
4. **Save**

### 10.4 — Créer le fichier sonar-project.properties

Créer à la racine du projet :

```properties
sonar.projectKey=medibook_web
sonar.organization=bayebaradiop
sonar.projectName=medibook_web
sonar.sources=src
sonar.exclusions=**/test/**,**/*.test.ts,**/*.test.tsx,**/node_modules/**,**/dist/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.host.url=https://sonarcloud.io
```

---

## ÉTAPE 11 — Ajouter les credentials Docker Hub dans Jenkins

**Ça sert à quoi ?** Jenkins doit se connecter à Docker Hub pour pousser l'image Docker. On stocke le nom d'utilisateur et le mot de passe de façon sécurisée dans Jenkins.

1. **Manage Jenkins** → **Credentials** → **(global)** → **Add Credentials**
2. **Kind** : `Username with password`
3. Remplir :
   - **Username** : votre nom d'utilisateur Docker Hub
   - **Password** : votre mot de passe ou access token Docker Hub
   - **ID** : `dockerhub-credentials` (exactement ce nom)
4. **Save**

---

## ÉTAPE 12 — Créer un Service Principal Azure

**Ça sert à quoi ?** Un Service Principal est un "compte de service" Azure. Au lieu de donner votre login/mot de passe personnel à Jenkins, on crée un compte dédié avec des permissions limitées. C'est plus sécurisé.

```bash
# Se connecter à Azure
az login

# Voir votre Subscription ID
az account show --query id -o tsv
```

Notez le **Subscription ID** affiché, puis :

```bash
# Créer le Service Principal
az ad sp create-for-rbac --name "jenkins-medibook" --role Contributor \
  --scopes /subscriptions/VOTRE_SUBSCRIPTION_ID
```

La commande retourne un JSON :
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",       ← votre Client ID
  "displayName": "jenkins-medibook",
  "password": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     ← votre Client Secret
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"        ← votre Tenant ID
}
```

> **IMPORTANT** : Notez ces 4 valeurs (Subscription ID, appId, password, tenant). Vous en aurez besoin à l'étape suivante.

---

## ÉTAPE 13 — Ajouter les credentials Azure dans Jenkins

**Ça sert à quoi ?** On enregistre les identifiants du Service Principal dans Jenkins pour que le pipeline puisse se connecter à Azure automatiquement (pour Terraform et Ansible).

1. **Manage Jenkins** → **Credentials** → **(global)** → **Add Credentials**
2. **Kind** : `Azure Service Principal`
3. Remplir :
   - **ID** : `azure-credentials` (exactement ce nom)
   - **Subscription ID** : votre Subscription ID Azure
   - **Client ID** : la valeur `appId`
   - **Client Secret** : la valeur `password`
   - **Tenant ID** : la valeur `tenant`
4. Cliquer **Verify** pour vérifier que la connexion fonctionne
5. **Save**

> **Note** : Si le type "Azure Service Principal" n'apparaît pas, vérifiez que le plugin `Azure Credentials` est bien installé (Étape 8).

---

## ÉTAPE 14 — Créer les fichiers Terraform

**Ça sert à quoi ?** Terraform permet de décrire l'infrastructure Azure dans du code (Infrastructure as Code). Au lieu de créer les ressources manuellement dans le portail Azure, on les décrit dans des fichiers `.tf`. Terraform crée automatiquement tout ce qu'il faut.

### 14.1 — Créer le dossier et les fichiers

```bash
mkdir -p terraform
```

### 14.2 — Fichier `terraform/variables.tf`

```hcl
variable "subscription_id" {
  description = "ID de l'abonnement Azure"
  type        = string
}
```

**Résumé** : Déclare la variable `subscription_id` que Jenkins passera automatiquement.

### 14.3 — Fichier `terraform/main.tf`

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

# 1. Resource Group — le "dossier" qui contient toutes les ressources
resource "azurerm_resource_group" "rg" {
  name     = "rg-medibook"
  location = "Brazil South"
}

# 2. App Service Plan — le serveur qui héberge l'application (plan gratuit F1)
resource "azurerm_service_plan" "plan" {
  name                = "plan-medibook"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "F1"
}

# 3. Web App — l'application elle-même, qui utilise notre image Docker
resource "azurerm_linux_web_app" "app" {
  name                = "medibook-web-odc"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    always_on = false
    application_stack {
      docker_image_name = "bayebara01012000/medibook-web:latest"
    }
  }
}
```

**Résumé** : Terraform crée 3 ressources Azure :
| Ressource | Nom | Rôle |
|-----------|-----|------|
| Resource Group | `rg-medibook` | Conteneur logique de toutes les ressources |
| App Service Plan | `plan-medibook` | Serveur (plan gratuit F1) |
| Linux Web App | `medibook-web-odc` | L'application qui tire l'image Docker Hub |

---

## ÉTAPE 15 — Créer les fichiers Ansible

**Ça sert à quoi ?** Ansible automatise le déploiement. Après que Terraform ait créé l'infrastructure, Ansible met à jour l'image Docker sur Azure, redémarre l'application et vérifie qu'elle fonctionne.

### 15.1 — Créer le dossier et les fichiers

```bash
mkdir -p ansible
```

### 15.2 — Fichier `ansible/ansible.cfg`

```ini
[defaults]
inventory = inventory.ini
host_key_checking = False
```

**Résumé** : Configuration de base d'Ansible. `host_key_checking = False` évite les questions de confirmation SSH.

### 15.3 — Fichier `ansible/inventory.ini`

```ini
[azure_app]
medibook-web.azurewebsites.net
```

**Résumé** : Déclare notre cible de déploiement (l'App Service Azure).

### 15.4 — Fichier `ansible/playbook.yml`

```yaml
---
- name: Déployer medibook-web sur Azure App Service
  hosts: localhost
  connection: local

  tasks:
    # 1. Met à jour l'image Docker utilisée par Azure App Service
    - name: Mettre à jour l'image Docker sur Azure App Service
      shell: >
        az webapp config container set
        --name medibook-web-odc
        --resource-group rg-medibook
        --docker-custom-image-name bayebara01012000/medibook-web:latest

    # 2. Redémarre l'App Service pour qu'il tire la nouvelle image
    - name: Redémarrer l'App Service pour tirer la dernière image
      shell: az webapp restart --name medibook-web-odc --resource-group rg-medibook

    # 3. Attend 30 secondes que l'app redémarre
    - name: Attendre le redémarrage
      pause:
        seconds: 30

    # 4. Vérifie que l'app répond (HTTP 200) — réessaie 5 fois si nécessaire
    - name: Vérifier que l'app répond
      uri:
        url: "https://medibook-web-odc.azurewebsites.net"
        status_code: 200
        validate_certs: yes
      register: result
      retries: 5
      delay: 15
      until: result.status == 200

    # 5. Affiche le résultat final
    - name: Afficher le résultat
      debug:
        msg: "L'application est accessible sur https://medibook-web-odc.azurewebsites.net (HTTP {{ result.status }})"
```

**Résumé** : Le playbook fait 5 actions dans l'ordre :
1. Dire à Azure d'utiliser la dernière image Docker
2. Redémarrer l'application
3. Attendre 30 secondes
4. Vérifier que le site répond (HTTP 200)
5. Afficher le résultat

---

## ÉTAPE 16 — Créer le Jenkinsfile (Pipeline complet)

**Ça sert à quoi ?** Le Jenkinsfile décrit les 9 étapes du pipeline. C'est le fichier le plus important : il orchestre tout, du checkout du code jusqu'au déploiement. Un seul clic sur "Build" déclenche tout.

Créer le fichier `Jenkinsfile` à la racine du projet :

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'    // Utilise le NodeJS configuré à l'étape 9
    }

    environment {
        DOCKER_IMAGE = 'bayebara01012000/medibook-web'   // Nom de l'image Docker Hub
        DOCKER_TAG = "${BUILD_NUMBER}"                    // Tag = numéro du build
    }

    stages {

        // ──── ÉTAPE 1 : Récupérer le code source ────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ──── ÉTAPE 2 : Installer les dépendances ────
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        // ──── ÉTAPE 3 : Lancer les tests ────
        stage('Test') {
            steps {
                sh 'npm run test -- --run --coverage'
            }
        }

        // ──── ÉTAPE 4 : Analyse de qualité du code ────
        stage('SonarCloud') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=medibook_web \
                          -Dsonar.organization=bayebaradiop \
                          -Dsonar.sources=src \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.host.url=https://sonarcloud.io
                    '''
                }
            }
        }

        // ──── ÉTAPE 5 : Construire l'image Docker ────
        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        // ──── ÉTAPE 6 : Scanner l'image Docker pour les vulnérabilités ────
        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ──── ÉTAPE 7 : Pousser l'image sur Docker Hub ────
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        // ──── ÉTAPE 8 : Provisionner l'infrastructure Azure avec Terraform ────
        stage('Terraform') {
            steps {
                withCredentials([azureServicePrincipal('azure-credentials')]) {
                    dir('terraform') {
                        sh '''
                            export ARM_CLIENT_ID=$AZURE_CLIENT_ID
                            export ARM_CLIENT_SECRET=$AZURE_CLIENT_SECRET
                            export ARM_TENANT_ID=$AZURE_TENANT_ID
                            export ARM_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID

                            terraform init -input=false

                            # Import des ressources existantes (ignore si déjà dans le state)
                            terraform import -var="subscription_id=$AZURE_SUBSCRIPTION_ID" azurerm_resource_group.rg /subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/rg-medibook || true
                            terraform import -var="subscription_id=$AZURE_SUBSCRIPTION_ID" azurerm_service_plan.plan /subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/rg-medibook/providers/Microsoft.Web/serverFarms/plan-medibook || true
                            terraform import -var="subscription_id=$AZURE_SUBSCRIPTION_ID" azurerm_linux_web_app.app /subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/rg-medibook/providers/Microsoft.Web/sites/medibook-web-odc || true

                            terraform plan -out=tfplan -input=false -var="subscription_id=$AZURE_SUBSCRIPTION_ID"
                            terraform apply -auto-approve tfplan
                        '''
                    }
                }
            }
        }

        // ──── ÉTAPE 9 : Déployer sur Azure avec Ansible ────
        stage('Ansible Deploy') {
            steps {
                withCredentials([azureServicePrincipal('azure-credentials')]) {
                    dir('ansible') {
                        sh '''
                            export AZURE_CLIENT_ID=$AZURE_CLIENT_ID
                            export AZURE_SECRET=$AZURE_CLIENT_SECRET
                            export AZURE_TENANT=$AZURE_TENANT_ID
                            export AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID

                            az login --service-principal \
                                -u $AZURE_CLIENT_ID \
                                -p $AZURE_CLIENT_SECRET \
                                --tenant $AZURE_TENANT_ID

                            ansible-playbook playbook.yml
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            // Nettoyer l'image Docker locale pour libérer de l'espace
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
        }
    }
}
```

**Résumé du pipeline complet** :
```
Build Now →
  1. Checkout          → récupère le code depuis Git
  2. Install           → npm ci (installe les dépendances)
  3. Test              → lance les tests + couverture
  4. SonarCloud        → analyse la qualité du code
  5. Docker Build      → construit l'image Docker
  6. Trivy Scan        → scanne les vulnérabilités
  7. Docker Push       → pousse l'image sur Docker Hub
  8. Terraform         → crée/vérifie l'infrastructure Azure
  9. Ansible Deploy    → déploie l'app et vérifie qu'elle répond
```

---

## ÉTAPE 17 — Créer le pipeline dans Jenkins

**Ça sert à quoi ?** On crée le job Jenkins qui va lire le Jenkinsfile depuis Git et exécuter automatiquement les 9 étapes.

1. Dans Jenkins → **New Item**
2. Nom : `medibook-web`
3. Type : **Pipeline**
4. Cliquer **OK**
5. Section **Pipeline** :
   - **Definition** : `Pipeline script from SCM`
   - **SCM** : `Git`
   - **Repository URL** : l'URL de votre dépôt Git
   - **Branch** : `*/votre_branche`
   - **Script Path** : `Jenkinsfile`
6. **Save**

---

## ÉTAPE 18 — Lancer le premier build

**Ça sert à quoi ?** Tester que tout fonctionne de bout en bout.

1. Cliquer **Build Now**
2. Suivre l'avancement dans **Console Output** (cliquer sur le numéro du build → Console Output)
3. Si tout est vert ✅ → l'application est déployée sur Azure !

**En cas d'erreur** :
| Erreur | Solution |
|--------|----------|
| `npm: not found` | Vérifier que NodeJS-18 est configuré (Étape 9) |
| `docker: not found` | Vérifier que Docker CLI est dans le Dockerfile Jenkins (Étape 4) |
| `terraform: not found` | Rebuilder l'image Jenkins : `docker compose build --no-cache jenkins` |
| `Could not find credentials` | Vérifier les ID des credentials (Étapes 11, 13) |
| `terraform import error` | Les ressources n'existent pas encore, c'est normal au premier lancement |
| `az login failed` | Vérifier les credentials Azure (Étape 13) |

---

## ÉTAPE 19 — Pousser le code et vérifier

**Ça sert à quoi ?** Sauvegarder tous les fichiers de configuration dans Git.

```bash
git add .
git commit -m "Configuration complète CI/CD : Jenkins + Terraform + Ansible"
git push origin votre_branche
```

---

## Récapitulatif de l'arborescence finale

```
medibook_web/
├── Dockerfile                    ← Image Docker de l'application
├── Jenkinsfile                   ← Pipeline CI/CD (9 étapes)
├── docker-compose.yml            ← Lancement de Jenkins
├── sonar-project.properties      ← Configuration SonarCloud
├── package.json
├── src/                          ← Code source React
├── nginx/
│   └── default.conf              ← Configuration du serveur web
├── jenkins/
│   └── Dockerfile                ← Image Jenkins personnalisée (5 outils)
├── terraform/
│   ├── main.tf                   ← Infrastructure Azure (3 ressources)
│   └── variables.tf              ← Variables Terraform
└── ansible/
    ├── ansible.cfg               ← Configuration Ansible
    ├── inventory.ini             ← Cible de déploiement
    └── playbook.yml              ← Script de déploiement (5 tâches)
```

---

## Récapitulatif des credentials Jenkins

| ID | Type | À quoi ça sert |
|----|------|----------------|
| `dockerhub-credentials` | Username/Password | Pousser l'image sur Docker Hub |
| `sonarcloud-token` | Secret text | Envoyer le code à SonarCloud |
| `azure-credentials` | Azure Service Principal | Terraform + Ansible → Azure |

---

> **Résultat final** : Un seul clic sur **Build Now** dans Jenkins exécute les 9 étapes automatiquement : du code source jusqu'à l'application déployée et vérifiée sur Azure.
