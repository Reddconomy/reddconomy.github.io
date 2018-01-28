#!/bin/bash
echo "Generate..."
./generate.sh
echo "Generated!"


if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    exit 0
fi

echo "Deploy"

rm -Rf .git
rm -Rf tmp

git clone https://${GH_TOKEN}@github.com/Reddconomy/reddconomy.github.io.git tmp
cd tmp
git checkout master
cd ..

mv tmp/.git dist/


cd dist
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"

git add .
git commit -m "Travis build: $TRAVIS_BUILD_NUMBER"

git remote add origin https://${GH_TOKEN}@github.com/Reddconomy/reddconomy.github.io.git > /dev/null 2>&1
git push  origin master --force
