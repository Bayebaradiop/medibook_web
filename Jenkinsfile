pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        DOCKER_IMAGE = 'bayebara01012000/medibook-web'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test -- --run --coverage'
            }
        }

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

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

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
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
        }
    }
}
