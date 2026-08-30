# Étapes de création du pipeline DevOps

---

## Étape 1 : Docker — Créer le Dockerfile

Créer `Dockerfile` à la racine du projet :
- Build multi-stage : `node:18-alpine` pour compiler, `nginx:alpine` pour servir
- Copie le build React dans Nginx

Créer `nginx/default.conf` :
- `try_files $uri $uri/ /index.html` pour le routing SPA React

```bash
# Tester le build en local
docker build -t medibook-web .
docker run -p 3000:80 medibook-web
# → http://localhost:3000
```

---

## Étape 2 : Jenkins — Mettre en place le CI/CD

### 2.1 — Créer l'image Jenkins personnalisée

Créer `jenkins/Dockerfile` :
- Base : `jenkins/jenkins:lts`
- Installer Docker CLI (pour builder des images)
- Installer Trivy (pour scanner les vulnérabilités)

### 2.2 — Créer le docker-compose

Créer `docker-compose.yml` :
- Service jenkins, port `8087:8080`
- Monter `/var/run/docker.sock` (accès Docker depuis Jenkins)
- Volume persistant `medibook_web_jenkins_home`

### 2.3 — Démarrer Jenkins

```bash
docker volume create medibook_web_jenkins_home
docker compose up -d
```

### 2.4 — Configurer Jenkins (http://localhost:8087)

```bash
# Récupérer le mot de passe initial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

1. Installer les plugins suggérés
2. Installer les plugins supplémentaires :
   - **NodeJS Plugin**
   - **SonarQube Scanner**
   - **Docker Pipeline**
3. Configurer NodeJS : `Manage Jenkins → Tools → NodeJS → Add → Name: NodeJS-18`
4. Créer le job Pipeline : `New Item → Pipeline → Git URL + branche bara_dev + Script Path: Jenkinsfile`

### 2.5 — Créer le Jenkinsfile

Créer `Jenkinsfile` avec 7 stages :
1. Checkout
2. Install (`npm ci`)
3. Test (`npm run test -- --run`)
4. SonarCloud
5. Docker Build
6. Trivy Scan
7. Docker Push

---

## Étape 3 : SonarCloud — Analyse qualité

### 3.1 — Créer le compte

1. Aller sur https://sonarcloud.io → se connecter avec GitHub
2. Importer le repo `medibook_web`
3. Générer un token : `My Account → Security → Generate Token`

### 3.2 — Configurer dans Jenkins

1. Ajouter le token : `Manage Jenkins → Credentials → Add → Secret text` (ID: sonarcloud-token)
2. Configurer le serveur : `Manage Jenkins → System → SonarQube servers → Add`
   - Name: `SonarCloud`
   - URL: `https://sonarcloud.io`
   - Token: le credential créé

### 3.3 — Créer le fichier de config

Créer `sonar-project.properties` :
```
sonar.projectKey=medibook_web
sonar.organization=bayebaradiop
sonar.sources=src
```

---

## Étape 4 : Docker Hub — Registry d'images

### 4.1 — Créer le compte

1. Aller sur https://hub.docker.com → créer un compte
2. Créer un repository `medibook-web`

### 4.2 — Ajouter les credentials dans Jenkins

`Manage Jenkins → Credentials → Add → Username with password`
- ID: `dockerhub-credentials`
- Username: ton identifiant Docker Hub
- Password: ton mot de passe / token

---

## Étape 5 : Terraform — Infrastructure Azure

### 5.1 — Installer Terraform et Azure CLI

```bash
# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Terraform
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### 5.2 — Créer les fichiers Terraform

Créer `terraform/main.tf` avec 3 ressources :
- `azurerm_resource_group` → rg-medibook
- `azurerm_service_plan` → plan-medibook (Linux, F1 gratuit)
- `azurerm_linux_web_app` → medibook-web (image Docker Hub)

Créer `terraform/variables.tf` → variable subscription_id
Créer `terraform/terraform.tfvars` → valeur du subscription_id
Créer `terraform/outputs.tf` → affiche l'URL de l'app

### 5.3 — Déployer l'infrastructure

```bash
az login
cd terraform
terraform init
terraform plan
terraform apply
# Taper "yes"
cd ..
```

Résultat : https://medibook-web.azurewebsites.net est créé sur Azure.

---

## Étape 6 : Ansible — Déploiement automatisé

### 6.1 — Installer Ansible

```bash
sudo apt install ansible -y
```

### 6.2 — Créer les fichiers

Créer `ansible/ansible.cfg` → configuration de base
Créer `ansible/inventory.ini` → localhost
Créer `ansible/playbook.yml` avec 5 tâches :
1. `az webapp config container set` → met à jour l'image Docker
2. `az webapp restart` → redémarre l'app
3. `pause 30s` → attend le redémarrage
4. `uri` → vérifie HTTP 200 (5 retries)
5. `debug` → affiche le résultat

### 6.3 — Lancer un déploiement

```bash
az login
cd ansible
ansible-playbook playbook.yml
cd ..
```

---

## Étape 7 : Prometheus + Grafana — Monitoring métriques

### 7.1 — Créer les fichiers de config

Créer `monitoring/prometheus.yml` :
- Scrape le backend Spring Boot sur `/actuator/prometheus` toutes les 15s

Créer `monitoring/grafana/provisioning/datasources/datasource.yml` :
- Source Prometheus → `http://prometheus:9090`

Créer `monitoring/grafana/provisioning/dashboards/dashboard.yml` :
- Charge les dashboards JSON au démarrage

Créer `monitoring/grafana/dashboards/medibook-dashboard.json` :
- Dashboard avec panneaux (logins, users, RDV, latence HTTP, etc.)

### 7.2 — Ajouter au docker-compose.monitoring.yml

Créer `docker-compose.monitoring.yml` avec :
- Prometheus → port `9090`
- Grafana → port `3001`, login `admin/admin`

### 7.3 — Démarrer

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Vérifier :
- http://localhost:9090/targets → backend doit être UP
- http://localhost:3001 → dashboard Grafana (admin/admin)

---

## Étape 8 : ELK Stack — Centralisation des logs

### 8.1 — Ajouter ELK au docker-compose.monitoring.yml

Ajouter 3 services dans `docker-compose.monitoring.yml` :
- Elasticsearch → port `9200`
- Logstash → port `5000` (TCP)
- Kibana → port `5601`

### 8.2 — Créer le pipeline Logstash

Créer `monitoring/logstash/pipeline/logstash.conf` :
- Input : TCP port 5000, codec json_lines
- Output : Elasticsearch, index `medibook-logs-YYYY.MM.dd`

### 8.3 — Configurer le backend Spring Boot

Ajouter dans `pom.xml` :
```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

Créer `src/main/resources/logback-spring.xml` :
- Appender LOGSTASH → envoie les logs en JSON vers Logstash (TCP port 5000)

### 8.4 — Démarrer et vérifier

```bash
docker compose -f docker-compose.monitoring.yml up -d

# Vérifier Elasticsearch
curl http://localhost:9200

# Envoyer un log de test
echo '{"level":"INFO","message":"Test log","app":"medibook-api"}' | nc -w1 localhost 5000
```

### 8.5 — Configurer Kibana (http://localhost:5601)

1. `Stack Management → Data Views → Create`
2. Index pattern : `medibook-logs-*`, Timestamp : `@timestamp`
3. `Discover` → les logs apparaissent

---

## Résumé de l'ordre

| # | Quoi | Résultat |
|---|------|----------|
| 1 | Dockerfile + nginx | Image Docker de l'app |
| 2 | Jenkins (docker-compose + Jenkinsfile) | Pipeline CI/CD automatisé |
| 3 | SonarCloud (compte + config Jenkins) | Analyse qualité à chaque build |
| 4 | Docker Hub (compte + credentials Jenkins) | Images publiées automatiquement |
| 5 | Terraform (main.tf + apply) | Infrastructure Azure créée |
| 6 | Ansible (playbook + run) | Déploiement automatisé |
| 7 | Prometheus + Grafana (docker-compose) | Métriques en temps réel |
| 8 | ELK Stack (docker-compose + logback) | Logs centralisés et recherchables |
