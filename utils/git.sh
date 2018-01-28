#!/bin/sh
#https://gist.github.com/willprice/e07efd73fb7f13f917ea
setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_website_files() {
  git checkout -b master
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin https://${GH_TOKEN}@github.com/Reddconomy/reddconomy.github.io.git > /dev/null 2>&1
  git push --quiet --set-upstream origin master
}


