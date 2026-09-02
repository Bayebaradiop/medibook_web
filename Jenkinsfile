pipeline {
    agent { label 'docker-medibook' }

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        DOCKER_IMAGE = 'abdoulayely777/medibook-web'
        APP_NAME = 'medibook-web-front'
        RESOURCE_GROUP = 'rg-medibook'
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

        stage('Deploy to Azure Web App') {
            steps {
                echo '🚀 Déploiement et rafraîchissement sur Azure...'
                withCredentials([
                    string(credentialsId: 'AZURE_CLIENT_ID', variable: 'CLIENT_ID'),
                    string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'CLIENT_SECRET'),
                    string(credentialsId: 'AZURE_TENANT_ID', variable: 'TENANT_ID'),
                    string(credentialsId: 'AZURE_SUBSCRIPTION_ID', variable: 'SUBSCRIPTION_ID')
                ]) {
                    sh '''
                        export PATH=/usr/local/bin:$PATH

                        if command -v terraform >/dev/null 2>&1 || [ -f /usr/local/bin/terraform ]; then
                            echo "Exécution de Terraform..."
                            cd terraform
                            export ARM_CLIENT_ID=$CLIENT_ID
                            export ARM_CLIENT_SECRET=$CLIENT_SECRET
                            export ARM_TENANT_ID=$TENANT_ID
                            export ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
                            terraform init -input=false
                            terraform apply -auto-approve -var="subscription_id=$SUBSCRIPTION_ID"
                            cd ..
                        else
                            echo "Terraform non binaire sur l'agent, bascule sur Azure CLI..."
                        fi

                        echo "Connexion Azure CLI et déploiement du conteneur..."
                        
                        run_with_retry() {
                            n=1
                            max=5
                            delay=5
                            while true; do
                                "$@" && break || {
                                    if [ $n -lt $max ]; then
                                        n=$((n+1))
                                        echo "⚠️ Micro-coupure réseau Azure subie. Retentative $n/$max dans $delay secondes..."
                                        sleep $delay
                                    else
                                        echo "❌ Échec de la connexion après $max tentatives."
                                        return 1
                                    fi
                                }
                            done
                        }

                        run_with_retry az login --service-principal -u $CLIENT_ID -p $CLIENT_SECRET --tenant $TENANT_ID --output none
                        run_with_retry az account set --subscription $SUBSCRIPTION_ID
                        run_with_retry az webapp config container set --name ${APP_NAME} --resource-group ${RESOURCE_GROUP} --container-image-name ${DOCKER_IMAGE}:${COMMIT_TAG}
                        run_with_retry az webapp restart --name ${APP_NAME} --resource-group ${RESOURCE_GROUP}
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
