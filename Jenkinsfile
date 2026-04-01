pipeline {
  agent any

  tools {
    nodejs 'Node 18'
  }

  environment {
    SONAR_TOKEN = credentials('SONAR_TOKEN')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarCloud Scan') {
      steps {
        sh '''
          npx sonar-scanner \
            -Dsonar.projectKey=medibook_web \
            -Dsonar.organization=bayebaradiop \
            -Dsonar.sources=src \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.token=$SONAR_TOKEN
        '''
      }
    }
  }
}
