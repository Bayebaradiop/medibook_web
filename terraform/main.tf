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

# 1. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "rg-medibook"
  location = "Germany West Central"
}

# 2. App Service Plan (gratuit F1)
resource "azurerm_service_plan" "plan" {
  name                = "plan-medibook"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "F1"
}

# 3. App Service (conteneur Docker depuis Docker Hub)
resource "azurerm_linux_web_app" "app" {
  name                = "medibook-web"
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
