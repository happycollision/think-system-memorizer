#!/bin/bash

# via https://gist.github.com/SangsooNam/06de16f154d0e9a08b436a7252e80f34

directory=deploy.ignore
branch=gh-pages
build_command() {
  docker compose run --rm app npm run build
  # at this point in the script, we will be inside the $directory
  cp -R ../dist/* .
}

echo -e "\033[0;32mDeleting old content...\033[0m"
rm -rf $directory

echo -e "\033[0;32mChecking out $branch....\033[0m"
git worktree add $directory $branch

echo -e "\033[0;32mCleaning $directory...\033[0m"
cd $directory &&
  git rm -rf *

echo -e "\033[0;32mGenerating site...\033[0m"
build_command

echo -e "\033[0;32mDeploying $branch branch...\033[0m"
git add --all &&
  git commit -m "Deploy updates" &&
  git push origin $branch

echo -e "\033[0;32mCleaning up...\033[0m"
git worktree remove $directory