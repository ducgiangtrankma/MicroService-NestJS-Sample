.PHONY: help setup build start stop restart logs clean kong-config test-api

# Kong Gateway + MicroServices Management
# =====================================

# Variables
COMPOSE_FILE = docker-compose.microservices.yml
KONG_ADMIN = http://localhost:8001
KONG_PROXY = http://api.microservice.local:8000

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Kong Gateway + MicroServices Management$(NC)"
	@echo "========================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

setup: ## Initial setup - copy env and add hosts entry
	@echo "$(YELLOW)Setting up Kong Gateway environment...$(NC)"
	@if [ ! -f .env ]; then cp environment.sample .env && echo "$(GREEN)✅ Created .env file$(NC)"; fi
	@echo "$(YELLOW)Adding api.microservice.local to /etc/hosts...$(NC)"
	@if ! grep -q "api.microservice.local" /etc/hosts; then \
		echo "127.0.0.1 api.microservice.local" | sudo tee -a /etc/hosts; \
		echo "$(GREEN)✅ Added domain to /etc/hosts$(NC)"; \
	else \
		echo "$(GREEN)✅ Domain already exists in /etc/hosts$(NC)"; \
	fi
	@echo "$(BLUE)ℹ️  Please update .env file with your actual credentials$(NC)"

build: ## Build all Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ All images built successfully$(NC)"

start: ## Start all services
	@echo "$(YELLOW)Starting Kong Gateway + MicroServices...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ All services started$(NC)"
	@echo "$(BLUE)ℹ️  Waiting for services to be ready...$(NC)"
	@sleep 30
	@$(MAKE) status

stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ All services stopped$(NC)"

restart: stop start ## Restart all services

logs: ## Show logs for all services
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-kong: ## Show Kong Gateway logs
	docker-compose -f $(COMPOSE_FILE) logs -f kong-gateway

logs-services: ## Show microservices logs
	docker-compose -f $(COMPOSE_FILE) logs -f user-service sender-service social-service

status: ## Check status of all services
	@echo "$(BLUE)Checking service status...$(NC)"
	@echo "$(YELLOW)Docker Containers:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)Service Health Checks:$(NC)"
	@echo -n "Kong Admin API: "
	@if curl -f $(KONG_ADMIN)/status > /dev/null 2>&1; then echo "$(GREEN)✅ UP$(NC)"; else echo "$(RED)❌ DOWN$(NC)"; fi
	@echo -n "UserService: "
	@if curl -f http://localhost:3001/health > /dev/null 2>&1; then echo "$(GREEN)✅ UP$(NC)"; else echo "$(RED)❌ DOWN$(NC)"; fi
	@echo -n "SenderService: "
	@if curl -f http://localhost:3002/health > /dev/null 2>&1; then echo "$(GREEN)✅ UP$(NC)"; else echo "$(RED)❌ DOWN$(NC)"; fi
	@echo -n "SocialService: "
	@if curl -f http://localhost:3003/health > /dev/null 2>&1; then echo "$(GREEN)✅ UP$(NC)"; else echo "$(RED)❌ DOWN$(NC)"; fi

kong-config: ## Configure Kong Gateway (run after start)
	@echo "$(YELLOW)Configuring Kong Gateway...$(NC)"
	@chmod +x kong-config.sh
	@./kong-config.sh
	@echo "$(GREEN)✅ Kong Gateway configured successfully$(NC)"

kong-status: ## Show Kong Gateway configuration
	@echo "$(BLUE)Kong Gateway Configuration:$(NC)"
	@echo "$(YELLOW)Services:$(NC)"
	@curl -s $(KONG_ADMIN)/services | jq -r '.data[] | "  - \(.name): \(.url)"' 2>/dev/null || echo "  Unable to fetch services"
	@echo "$(YELLOW)Routes:$(NC)"
	@curl -s $(KONG_ADMIN)/routes | jq -r '.data[] | "  - \(.name): \(.paths[])"' 2>/dev/null || echo "  Unable to fetch routes"
	@echo "$(YELLOW)Plugins:$(NC)"
	@curl -s $(KONG_ADMIN)/plugins | jq -r '.data[] | "  - \(.name): \(.enabled)"' 2>/dev/null || echo "  Unable to fetch plugins"

test-api: ## Test API endpoints through Kong Gateway
	@echo "$(BLUE)Testing API endpoints...$(NC)"
	@echo "$(YELLOW)Testing public endpoints:$(NC)"
	@echo -n "  Health Check: "
	@if curl -f $(KONG_PROXY)/api/v1/users/health > /dev/null 2>&1; then echo "$(GREEN)✅ OK$(NC)"; else echo "$(RED)❌ FAIL$(NC)"; fi
	@echo ""
	@echo "$(YELLOW)Testing rate limiting:$(NC)"
	@for i in {1..5}; do \
		response=$$(curl -s -w "HTTP %{http_code}" $(KONG_PROXY)/api/v1/users/health); \
		echo "  Request $$i: $$response"; \
	done

demo: ## Run a complete demo
	@echo "$(BLUE)Kong Gateway Demo$(NC)"
	@echo "=================="
	@echo ""
	@$(MAKE) setup
	@$(MAKE) build
	@$(MAKE) start
	@sleep 45
	@$(MAKE) kong-config
	@$(MAKE) kong-status
	@$(MAKE) test-api
	@echo ""
	@echo "$(GREEN)🎉 Demo completed successfully!$(NC)"
	@echo "$(BLUE)ℹ️  Access points:$(NC)"
	@echo "  - Kong Proxy: http://api.microservice.local:8000"
	@echo "  - Kong Admin: http://localhost:8001"  
	@echo "  - Kong Admin GUI: http://localhost:8002"
	@echo "  - Konga UI: http://localhost:1337"
	@echo "  - Grafana: http://localhost:3000 (admin/admin123)"
	@echo "  - Prometheus: http://localhost:9090"

clean: ## Remove all containers, volumes, and images
	@echo "$(YELLOW)Cleaning up all resources...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

reset: clean ## Complete reset - remove everything and start fresh
	@echo "$(YELLOW)Performing complete reset...$(NC)"
	docker system prune -af
	@$(MAKE) demo

# Development helpers
dev-build: ## Build and start for development
	@$(MAKE) build
	@$(MAKE) start
	@$(MAKE) kong-config

dev-logs: ## Follow logs for development
	docker-compose -f $(COMPOSE_FILE) logs -f kong-gateway user-service sender-service social-service

# Production helpers
prod-check: ## Production readiness check
	@echo "$(BLUE)Production Readiness Checklist:$(NC)"
	@echo "================================"
	@echo -n "1. Environment variables configured: "
	@if [ -f .env ]; then echo "$(GREEN)✅$(NC)"; else echo "$(RED)❌ .env file missing$(NC)"; fi
	@echo -n "2. SSL certificates: "
	@if [ -f kong.crt ] && [ -f kong.key ]; then echo "$(GREEN)✅$(NC)"; else echo "$(YELLOW)⚠️  Generate SSL certificates$(NC)"; fi
	@echo -n "3. External database configured: "
	@echo "$(YELLOW)⚠️  Configure external PostgreSQL$(NC)"
	@echo -n "4. Monitoring configured: "
	@if curl -f http://localhost:9090 > /dev/null 2>&1; then echo "$(GREEN)✅$(NC)"; else echo "$(RED)❌ Prometheus not accessible$(NC)"; fi

# Monitoring helpers
metrics: ## Show Kong metrics
	@curl -s $(KONG_ADMIN)/metrics

backup: ## Backup Kong configuration
	@echo "$(YELLOW)Backing up Kong configuration...$(NC)"
	@mkdir -p backups
	@curl -s $(KONG_ADMIN)/config > backups/kong-config-$$(date +%Y%m%d-%H%M%S).json
	@echo "$(GREEN)✅ Configuration backed up$(NC)"

# Quick commands
up: start ## Alias for start
down: stop ## Alias for stop
ps: status ## Alias for status

# Default target
all: demo ## Run complete demo (default)

# Help is default target
.DEFAULT_GOAL := help 