pipeline {
  agent { label 'infra_mesos' }

  environment {
    NPM_UTIL_PATH = "npm-utils"
    REPO_DIR = "repo"
    DOCS_DIR = "repo/doc-site"
  }

  tools {
    nodejs 'NodeJS 8.12.0'
  }

  stages {
    stage('Prep') {
      steps {
        deleteDir()
        dir(env.REPO_DIR) {
          echo "Building Branch: ${env.GIT_BRANCH}"
          checkout scm
        }
        sh "git clone --single-branch -b master --depth=1 git@bitbucket.org:inindca/npm-utils.git ${env.NPM_UTIL_PATH}"
        sh "${env.WORKSPACE}/${env.NPM_UTIL_PATH}/scripts/jenkins-create-npmrc.sh"
      }
    }

    stage('Build') {
      steps {
        dir(env.repo_dir) {
          // check to see if we need to bump the version for release
          sh "${env.workspace}/${env.npm_util_path}/scripts/auto-version-bump.sh"
        }
      }
    }

    stage('Publish Library') {
      steps {
        dir(env.REPO_DIR) {
          sh "npm config list"
          sh "npm publish"
          // Make a local branch so we can push back to the origin branch.
          sh "git checkout -b ${env.SHORT_BRANCH}"
          sh "git push --tags -u origin ${env.SHORT_BRANCH}"
        }
      }
    }

    stage('Build Docs') {
      steps {
        dir (env.REPO_DIR) {
          sh './scripts/generate-deploy-files'
          sh '''
              npm ci
              export CDN_URL=$(./node_modules/.bin/cdn --ecosystem gmsc --manifest manifest.json)
              npm run build
          '''
          sh 'npm run doc'
          sh './scripts/prepare-docs'
        }
      }
    }

    stage('Upload Docs') {
      steps {
        dir (env.REPO_DIR) {
          sh '''
             ./node_modules/.bin/upload \
               --ecosystem gmsc \
               --manifest manifest.json \
               --source-dir ./doc
          '''
        }
      }
    }

    stage('Deploy Docs') {
      steps {
        dir (env.REPO_DIR) {
          sh '''
             ./node_modules/.bin/deploy \
               --ecosystem gmsc \
               --manifest manifest.json \
               --dest-env dev
          '''
        }
      }
    }
  }
}
