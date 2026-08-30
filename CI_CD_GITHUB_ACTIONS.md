# Guide de Déploiement Frontend MediBook (`medibook_web`) avec Terraform & GitHub Actions

Ce document explique comment est structuré le pipeline CI/CD automatisé pour le projet Web React (`medibook_web`) vers Azure App Service avec Terraform et GitHub Actions.

---

## 🏗️ Architecture du Pipeline

```
[ Git Push / Main Branch ]
         │
         ├──► 🧪 Job 1: Test & Build (Node.js 18, Vitest, Vite Build)
         │
         ├──► 🐳 Job 2: Build & Push Docker Image (Docker Hub: bayebara01012000/medibook-web)
         │
         ├──► 🏗️ Job 3: Terraform Provision & Deploy (Azure Linux Web App)
         │
         └──► 🔄 Job 4: Refresh Azure Web App Container
```

---

## 🔑 1. Pré-requis & Configuration des Secrets GitHub

Pour autoriser GitHub Actions à provisionner l'infrastructure sur Azure et à publier sur Docker Hub, vous devez configurer les Secrets dans votre dépôt GitHub :

**`Settings` > `Secrets and variables` > `Actions` > `New repository secret`**

### Liste des Secrets requis :

| Nom du Secret | Description | Exemple / Valeur |
|---|---|---|
| `AZURE_CLIENT_ID` | App ID du Service Principal Azure | `xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_CLIENT_SECRET` | Mot de passe / Secret du Service Principal | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `AZURE_TENANT_ID` | Tenant ID Azure (Directory ID) | `xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_SUBSCRIPTION_ID` | ID de l'abonnement Azure | `xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `DOCKERHUB_USERNAME` | Nom d'utilisateur Docker Hub | `bayebara01012000` |
| `DOCKERHUB_TOKEN` | Access Token ou mot de passe Docker Hub | `dckr_pat_xxxxxxx` |

---

## 🛠️ 2. Création du Service Principal Azure (AZ CLI)

Si vous n'avez pas encore créé le Service Principal Azure pour GitHub Actions, exécutez ces commandes dans le terminal avec l'Azure CLI (`az`) :

```bash
# 1. Connexion à Azure
az login

# 2. Récupération de l'ID de votre abonnement
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# 3. Création du Service Principal avec les droits Contributeur
az ad sp create-for-rbac \
  --name "github-actions-medibook-web" \
  --role "Contributor" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID" \
  --sdk-auth
```

La commande retourne un bloc JSON similaire à :

```json
{
  "clientId": "<AZURE_CLIENT_ID>",
  "clientSecret": "<AZURE_CLIENT_SECRET>",
  "subscriptionId": "<AZURE_SUBSCRIPTION_ID>",
  "tenantId": "<AZURE_TENANT_ID>",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

---

## 📁 3. Structure des Fichiers de Déploiement

- **Workflow GitHub Actions** : `.github/workflows/deploy.yml`
- **Configuration Terraform** : `terraform/`
  - `main.tf` : Définit la Resource Group `rg-medibook`, l'App Service Plan `plan-medibook` (F1 Linux) et l'App Service `medibook-web-front`.
  - `variables.tf` : Déclare l'ensemble des variables d'environnement.
  - `outputs.tf` : Affiche l'URL publique de l'application (`https://medibook-web-front.azurewebsites.net`).
- **Conteneurisation** : `Dockerfile` & `nginx/default.conf`

---

## 🧪 4. Exécution Locale et Test des Commandes

### Tester le build et les tests frontend :
```bash
npm ci
npm run test -- --run
npm run build
```

### Valider la configuration Terraform :
```bash
cd terraform
terraform init -backend=false
terraform validate
```

---

## 🚀 5. Déclenchement du Déploiement Automatique

1. **Automatique** : Tout push sur la branche `main` (ou `master`) déclenchera automatiquement le workflow.
2. **Manuel** : Rendez-vous sur GitHub dans l'onglet **Actions** > **Frontend CI/CD Pipeline - Deploy to Azure** > **Run workflow**.
