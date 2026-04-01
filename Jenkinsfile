pipeline {
  agent any

  tools {
    nodejs 'Node 18'
  }

  environment {
    VERCEL_ORG_ID = credentials('VERCEL_ORG_ID')
    VERCEL_PROJECT_ID = credentials('ERCEL_PROJECT_ID')
    SONAR_TOKEN = credentials('SONAR_TOKEN')
    VERCEL_TOKEN = credentials('VERCEL_TOKEN')
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
            -Dsonar.organization=Bayebaradiop \
            -Dsonar.sources=src \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.token=$SONAR_TOKEN
        '''
      }
    }

    stage('Install Vercel CLI') {
      steps {
        sh 'npm install --global vercel@latest'
      }
    }

    stage('Deploy to Vercel') {
      steps {
        sh 'vercel pull --yes --environment=production --token=$VERCEL_TOKEN'
        sh 'vercel build --prod --token=$VERCEL_TOKEN'
        sh 'vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN'
      }
    }
  }
}
