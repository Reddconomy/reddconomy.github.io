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

#Purge cloudflare cache

curl -X DELETE "https://api.cloudflare.com/client/v4/zones/99db44fb5e894af060a361480263bd87/purge_cache" \
     -H "X-Auth-Email: ${CLOUDFLARE_AUTH_EMAIL}" \
     -H "X-Auth-Key:  ${CLOUDFLARE_AUTH_KEY}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'