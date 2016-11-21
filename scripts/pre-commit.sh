#!/bin/bash
# Git pre-commit hook
# 
# Install before running code:
# ln -s scripts/pre-commit.sh .git/hooks/pre-commit
# 

# Check that code passes linting
npm run lint