#!/bin/sh
if [[ ${TRAVIS_COMMIT} ]]; then
  TRAVIS_COMMIT="$TRAVIS_COMMIT/"
else
  echo "missing travis commit"
  TRAVIS_COMMIT=""
fi
DEPLOY_URL="https://ampath-poc.fra1.digitaloceanspaces.com/@ampath/esm-angular-form-entry/$TRAVIS_COMMIT"
echo $DEPLOY_URL
ng build --prod --output-hashing=none --deploy-url $DEPLOY_URL && npm run rename:mainjs
