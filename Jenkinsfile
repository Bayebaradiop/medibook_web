pipeline {
    agent { label 'docker-medibook' }

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        DOCKER_IMAGE = 'abdoulayely777/medibook-web'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checkout du code...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo '📦 Installation des dépendances...'
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Exécution des tests unitaires...'
                sh 'npm run test -- --run'
            }
        }

        stage('Login Registries') {
            steps {
                echo '🔐 Connexion à Docker Hub...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '🐳 Build de l\'image Docker...'
                script {
                    def commit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.COMMIT_TAG = commit
                }
                sh """
                    docker build -t ${DOCKER_IMAGE}:${COMMIT_TAG} -t ${DOCKER_IMAGE}:latest .
                """
            }
        }

        stage('Docker Push') {
            steps {
                echo '🚀 Push de l\'image vers Docker Hub...'
                sh """
                    docker push ${DOCKER_IMAGE}:${COMMIT_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Terraform Infrastructure & Deploy') {
            steps {
                echo '🏗️ Application de l\'infrastructure Terraform sur Azure...'
                withCredentials([
                    string(credentialsId: 'AZURE_CLIENT_ID', variable: 'ARM_CLIENT_ID'),
                    string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'ARM_CLIENT_SECRET'),
                    string(credentialsId: 'AZURE_TENANT_ID', variable: 'ARM_TENANT_ID'),
                    string(credentialsId: 'AZURE_SUBSCRIPTION_ID', variable: 'ARM_SUBSCRIPTION_ID')
                ]) {
                    dir('terraform') {
                        sh '''
                            export PATH=$PATH:/usr/local/bin:/usr/bin

                            terraform init -input=false

                            # Importation si nécessaire
                            terraform import -var="subscription_id=$ARM_SUBSCRIPTION_ID" azurerm_resource_group.rg /subscriptions/$ARM_SUBSCRIPTION_ID/resourceGroups/rg-medibook || true
                            terraform import -var="subscription_id=$ARM_SUBSCRIPTION_ID" azurerm_service_plan.plan /subscriptions/$ARM_SUBSCRIPTION_ID/resourceGroups/rg-medibook/providers/Microsoft.Web/serverFarms/plan-medibook || true
                            terraform import -var="subscription_id=$ARM_SUBSCRIPTION_ID" azurerm_linux_web_app.app /subscriptions/$ARM_SUBSCRIPTION_ID/resourceGroups/rg-medibook/providers/Microsoft.Web/sites/medibook-web-front || true

                            terraform plan -out=tfplan -input=false -var="subscription_id=$ARM_SUBSCRIPTION_ID"
                            terraform apply -auto-approve tfplan
                        '''
                    }
                }
            }
        }

        stage('Refresh Azure Web App') {
            steps {
                echo '🔄 Redémarrage du Web App Azure...'
                withCredentials([
                    string(credentialsId: 'AZURE_CLIENT_ID', variable: 'CLIENT_ID'),
                    string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'CLIENT_SECRET'),
                    string(credentialsId: 'AZURE_TENANT_ID', variable: 'TENANT_ID'),
                    string(credentialsId: 'AZURE_SUBSCRIPTION_ID', variable: 'SUBSCRIPTION_ID')
                ]) {
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/usr/bin

                        az login --service-principal \
                            -u $CLIENT_ID \
                            -p $CLIENT_SECRET \
                            --tenant $TENANT_ID --output none

                        az account set --subscription $SUBSCRIPTION_ID

                        az webapp restart --name medibook-web-front --resource-group rg-medibook
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Nettoyage des images locales...'
            sh '''
                docker logout || true
                docker rmi ${DOCKER_IMAGE}:${COMMIT_TAG} || true
                docker image prune -f || true
            '''
        }
        success {
            echo '🎉 Pipeline Jenkins réussi avec succès !'
        }
        failure {
            echo '❌ Échec du Pipeline Jenkins.'
        }
    }
}
