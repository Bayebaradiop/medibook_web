# Guide Commandes DevOps — MediBook Web

---

## 1. Démarrer tous les conteneurs

```bash
cd ~/BAYE_BARA_DIOP/odc-soutenance/odc/medibook_web

# Jenkins (CI/CD)
docker compose up -d

# Monitoring (Prometheus + Grafana)
docker compose -f docker-compose.monitoring.yml up -d

# Vérifier que tout tourne
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 2. URLs & Identifiants

| URL | Outil | Login |
|-----|-------|-------|
| http://localhost:8087 | Jenkins | *(configuré à l'installation)* |
| http://localhost:9090 | Prometheus | *(pas de login)* |
| http://localhost:3001 | Grafana | `admin` / `admin` |
| https://medibook-web.azurewebsites.net | App en production | — |
| https://sonarcloud.io/project/overview?id=medibook_web | SonarCloud | *(compte GitHub)* |
| https://hub.docker.com/r/bayebara01012000/medibook-web | Docker Hub | *(compte Docker Hub)* |
| https://portal.azure.com | Azure Portal | *(compte Azure)* |

---

## 3. Redéployer après une modification

```bash
cd ~/BAYE_BARA_DIOP/odc-soutenance/odc/medibook_web

# 1. Pousser le code sur GitHub
git add .
git commit -m "description de la modification"
git push origin bara_dev

# 2. Lancer le build sur Jenkins
#    → http://localhost:8087 → ton job → Build Now
#    → Attendre que les 9 stages passent ✅
#
#    Pipeline complet (tout automatique) :
#    Checkout → Install → Test → SonarCloud → Docker Build → Trivy Scan → Docker Push → Terraform → Ansible Deploy
#
#    ✅ Terraform provisionne/met à jour l'infra Azure automatiquement
#    ✅ Ansible déploie et vérifie l'app sur Azure automatiquement
#    ✅ Plus besoin de lancer manuellement az login / ansible-playbook
```

---

## 4. Arrêter tous les conteneurs

```bash
cd ~/BAYE_BARA_DIOP/odc-soutenance/odc/medibook_web

docker compose down
docker compose -f docker-compose.monitoring.yml down
```

---

## 5. Voir les logs d'un conteneur

```bash
docker logs jenkins
docker logs prometheus
docker logs grafana
```
