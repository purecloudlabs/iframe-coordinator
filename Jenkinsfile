@Library('pipeline-library')
import com.genesys.jenkins.Service

def notifications = null
String[] mailingList = [
  'CoreUI@genesys.com'
]

def isReleaseBranch() {
  return env.SHORT_BRANCH.equals('main') || env.SHORT_BRANCH.equals('master')
}

def isBetaBranch() {
  return env.SHORT_BRANCH.startsWith('beta/')
}

pipeline {
  agent { label 'dev_mesos_v2' }
  options {
    quietPeriod(480)
    disableConcurrentBuilds()
  }

  environment {
    NPM_UTIL_PATH = 'npm-utils'
    REPO_DIR = 'repo'
    SHORT_BRANCH = env.GIT_BRANCH.replaceFirst(/^origin\//, '')
    NPM_TOKEN = credentials('2844c47b-19b8-4c5f-b901-190de49c0883')
    ARTIFACTORY = credentials('14645c89-70a0-4b46-a8a2-2f0a580d13dd')
  }

  tools {
    nodejs 'NodeJS 20.x multiarch'
  }

  stages {
    stage('Import notifications lib') {
      steps {
        script {
          // clone pipelines repo
          dir('pipelines') {
            git branch: 'master',
                url: 'git@bitbucket.org:inindca/pipeline-library.git',
                changelog: false

            notifications = load 'src/com/genesys/jenkins/Notifications.groovy'
          }
        }
      }
    }

    stage('Checkout') {
      steps {
        deleteDir()
        dir(env.REPO_DIR) {
          checkout scm
          // Make a local branch so we can work with history and push (there's probably a better way to do this)
          sh "git checkout -b ${env.SHORT_BRANCH}"
        }
      }
    }

    stage('Avoid Build Loop') {
      steps {
        script {
          dir(env.REPO_DIR) {
            def lastCommit = sh(script: 'git log -n 1 --format=%s', returnStdout: true).trim()
            if (lastCommit.startsWith('chore(release)')) {
              currentBuild.description = 'Skipped'
              currentBuild.result = 'ABORTED'
              error('Last commit was a release, exiting build process.')
            }
          }
        }
      }
    }

    stage('Prep') {
      steps {
        sh "git clone --single-branch -b master --depth=1 git@bitbucket.org:inindca/npm-utils.git ${env.NPM_UTIL_PATH}"
        dir(env.REPO_DIR) {
          // Create an npmrc file, just so we can install deps cleanly from artifactory
          sh "${env.WORKSPACE}/${env.NPM_UTIL_PATH}/scripts/jenkins-create-npmrc.sh"
          sh 'npm ci'
        }
      }
    }

    stage('Check') {
      steps {
        dir(env.REPO_DIR) {
          sh 'npm run lint'
          sh 'npm run test'
        }
      }
    }

    stage('Build') {
      environment {
        GIT_COMMIT_SHORT = env.GIT_COMMIT.substring(0, 7)
      }
      steps {
        dir(env.REPO_DIR) {
          script {
            if (isReleaseBranch()) {
              sh 'npm run release -- --skip.tag'
            } else if (isBetaBranch()) {
              sh "npm run release -- --prerelease beta.$GIT_COMMIT_SHORT --skip.tag"
            }
            sh 'npm run sync-versions'
            sh 'npm run doc'
            sh 'npm run build'
          }
        }
      }
    }

    stage('Publish Library') {
      when {
        expression { isReleaseBranch() || isBetaBranch() }
      }
      steps {
        script {
          def publishFlags = ""
          if (isBetaBranch()) {
            publishFlags = "--tag beta"
          }
          dir(env.REPO_DIR) {
            sh '''
               echo "registry=https://registry.npmjs.org" >> ./.npmrc
               echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ./.npmrc
            '''
            sh "npm run publish.iframe-coordinator ${publishFlags}"
            sh "npm run publish.iframe-coordinator-cli ${publishFlags}"
            sh('''
                RELEASE_VERSION="$(npm run --silent current-version --workspace=iframe-coordinator)"
                npm install
                git add package-lock.json
                git add docs/
                git commit --amend --no-edit --no-verify
                git tag -fa v$RELEASE_VERSION -m "chore(release): $RELEASE_VERSION"
            ''')
            if (isReleaseBranch()) {
              sshagent(credentials: ['3aa16916-868b-4290-a9ee-b1a05343667e']) {
                sh "git push --follow-tags -u origin ${env.SHORT_BRANCH}"
              }
            }
          }
        }
      }
    }

    // stage('Build Docs') {
    //   steps {
    //     dir(env.REPO_DIR) {
    //       sh 'npm run doc'
    //       sh './scripts/generate-deploy-files'
    //       sh '''
    //           export CDN_ROOT=$(npx --package=@purecloud/web-app-deploy@8 -- cached-asset-prefix --ecosystem pc --manifest dist/docs/manifest.json)
    //           ./scripts/prepare-docs
    //       '''
    //     }
    //   }
    // }

    // stage('Upload Docs') {
    //   when {
    //     expression { isReleaseBranch()  }
    //   }
    //   steps {
    //     dir(env.REPO_DIR) {
    //       sh '''
    //          npx --package=@purecloud/web-app-deploy@8 -- upload \
    //            --ecosystem pc \
    //            --manifest dist/docs/manifest.json \
    //            --source-dir ./dist/docs
    //       '''
    //     }
    //   }
    // }

    // stage('Deploy Docs') {
    //   when {
    //     expression { isReleaseBranch()  }
    //   }
    //   steps {
    //     dir(env.REPO_DIR) {
    //       sh '''
    //          npx --package=@purecloud/web-app-deploy@8 -- deploy \
    //            --ecosystem pc \
    //            --manifest dist/docs/manifest.json \
    //            --dest-env dev
    //       '''
    //     }
    //   }
    // }
  }

  post {
    fixed {
      script {
        notifications.emailResults(mailingList.join(' '))
      }
    }

    failure {
      script {
        notifications.emailResults(mailingList.join(' '))
      }
    }
  }
}
