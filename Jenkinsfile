pipeline {
    agent any

    environment {
        // Secure ID of the DockerHub Credentials configured in Jenkins UI
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
        
        // Define Docker Hub target image naming structure
        DOCKER_IMAGE_NAME        = 'preethamvs6/portfolio-app'
        
        // Target container configurations
        CONTAINER_NAME           = 'portfolio-web-server'
        HOST_PORT                = '80'
        CONTAINER_PORT           = '80'
    }

    options {
        // Clean up workspaces from old builds to save EC2 disk space
        timeout(time: 10, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    stages {
        // ==========================================
        // STAGE 1: Clone Repository from GitHub
        // ==========================================
        stage('Clone Repository') {
            steps {
                echo '=== STAGE 1: CLONING REPOSITORY ==='
                // This checks out the code from the Git repository that triggered the job
                checkout scm
            }
        }

        // ==========================================
        // STAGE 2: Install Dependencies
        // ==========================================
        stage('Install Dependencies') {
            steps {
                echo '=== STAGE 2: INSTALLING NPM DEPENDENCIES ==='
                // Installs dependencies (Vite developer tools) defined in package.json
                sh 'npm install'
            }
        }

        // ==========================================
        // STAGE 3: Build Application
        // ==========================================
        stage('Build Application') {
            steps {
                echo '=== STAGE 3: COMPILING STATIC WEBPAGE PRODUCTION ASSETS ==='
                // Compiles files and bundles CSS/JS into the 'dist/' folder
                sh 'npm run build'
            }
        }

        // ==========================================
        // STAGE 4: Build Docker Image
        // ==========================================
        stage('Build Docker Image') {
            steps {
                echo '=== STAGE 4: COMPILING DOCKER CONTAINER IMAGE ==='
                // Builds the Docker image from our Dockerfile using the build number and latest tags
                sh "docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_NAME}:latest ."
            }
        }

        // ==========================================
        // STAGE 5: Push Docker Image to DockerHub
        // ==========================================
        stage('Push Docker Image') {
            steps {
                echo '=== STAGE 5: LOGGING TO DOCKERHUB AND PUSHING IMAGE ==='
                // Securely binds DockerHub credentials using username & password
                withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, 
                                                 usernameVariable: 'DOCKER_USER', 
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    // Log in to DockerHub securely without printing secrets
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    
                    // Push both the build number and the latest tag to DockerHub
                    sh "docker push ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_IMAGE_NAME}:latest"
                    
                    // Always clean up local login credentials immediately
                    sh 'docker logout'
                }
            }
        }

        // ==========================================
        // STAGE 6: Stop and Remove Old Container
        // ==========================================
        stage('Stop & Prune Old Container') {
            steps {
                echo '=== STAGE 6: STOPPING AND RECYCLING OLD DEPLOYED CONTAINER ==='
                // We run shell checks using '|| true' to prevent script failures if no prior container exists
                sh """
                    if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
                        echo "Found existing container: ${CONTAINER_NAME}. Stopping & removing..."
                        docker stop ${CONTAINER_NAME}
                        docker rm ${CONTAINER_NAME}
                    else
                        echo "No previous active container instance named ${CONTAINER_NAME} found."
                    fi
                """
            }
        }

        // ==========================================
        // STAGE 7: Deploy New Container Automatically
        // ==========================================
        stage('Deploy New Container') {
            steps {
                echo '=== STAGE 7: RUNNING NEW CONTAINER INSTANCE ON PORT 80 ==='
                // Starts the fresh container daemonized (-d) exposing Nginx on standard port 80
                sh "docker run -d --name ${CONTAINER_NAME} -p ${HOST_PORT}:${CONTAINER_PORT} ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}"
            }
        }

        // ==========================================
        // STAGE 8: Verify Application is Running
        // ==========================================
        stage('Verify Operational Health') {
            steps {
                echo '=== STAGE 8: RUNNING LIVE PORT CURL HEALTH CHECK ==='
                // Allow a brief buffer for Nginx process initiation, then loop-verify port status up to 5 times
                sh """
                    SUCCESS=false
                    for i in {1..5}; do
                        echo "Verification attempt \$i of 5..."
                        HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${HOST_PORT} || true)
                        
                        if [ "\$HTTP_STATUS" -eq 200 ]; then
                            echo "SUCCESS: Deployed application is fully operational! (HTTP \$HTTP_STATUS)"
                            SUCCESS=true
                            break
                        else
                            echo "Application response: HTTP \$HTTP_STATUS. Waiting for start-up..."
                            sleep 3
                        fi
                    done
                    
                    if [ "\$SUCCESS" = false ]; then
                        echo "ERROR: Health check verification failed. Application did not return HTTP 200."
                        exit 1
                    fi
                """
            }
        }
    }

    // ==========================================
    // PIPELINE POST-ACTIONS
    // ==========================================
    post {
        always {
            echo '=== PIPELINE EXECUTION SUMMARY ==='
            // Prune local unused images on the EC2 machine to conserve disk storage
            sh 'docker image prune -f'
        }
        success {
            echo '🟢 Build Success: Deployed portfolio container is operational.'
        }
        failure {
            echo '🔴 Build Failed: Check stage console logs for troubleshooting details.'
        }
    }
}
