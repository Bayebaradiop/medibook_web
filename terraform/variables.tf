variable "subscription_id" {
  description = "ID de l'abonnement Azure"
  type        = string
}

variable "resource_group_name" {
  description = "Nom du groupe de ressources Azure"
  type        = string
  default     = "rg-medibook"
}

variable "location" {
  description = "Région Azure pour la création des ressources"
  type        = string
  default     = "Brazil South"
}

variable "service_plan_name" {
  description = "Nom du plan App Service"
  type        = string
  default     = "plan-medibook"
}

variable "app_name" {
  description = "Nom unique de l'application Web Azure (Web App)"
  type        = string
  default     = "medibook-web-front"
}

variable "docker_image" {
  description = "Nom de l'image Docker avec tag"
  type        = string
  default     = "abdoulayely777/medibook-web:latest"
}
