output "app_url" {
  description = "URL publique de l'application web MediBook"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
}

output "resource_group_name" {
  description = "Nom du groupe de ressources Azure"
  value       = azurerm_resource_group.rg.name
}

output "web_app_name" {
  description = "Nom de l'App Service Azure"
  value       = azurerm_linux_web_app.app.name
}
