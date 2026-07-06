# Add to repo manually (requires `workflow` git scope)

Copy to `.github/workflows/sdk-codegen.yml` on GitHub UI or push with a PAT that has `workflow` scope.

```yaml
name: SDK Codegen

on:
  push:
    branches: [main, staging]
    paths:
      - 'packages/openapi/**'
      - 'scripts/generate-sdks.ts'
      - '.github/workflows/sdk-codegen.yml'
  pull_request:
    branches: [main, staging]
    paths:
      - 'packages/openapi/**'
      - 'scripts/generate-sdks.ts'
      - '.github/workflows/sdk-codegen.yml'
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
      - run: npm ci
      - run: npm run generate:sdks
      - run: |
          git diff --exit-code packages/sdk-go/generated \
            packages/sdk-python/generated \
            packages/sdk-java/generated \
            packages/sdk-rust/generated \
            packages/sdk-csharp/generated \
            packages/sdk-php/generated
```

Local file: `.github/workflows/sdk-codegen.yml` (untracked in dev until pushed).
