[![Community Project header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Community_Project.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#category-community-project)

# New Relic Capture Build Size 

[![GitHub Marketplace version](https://img.shields.io/github/release/newrelic/capture-build-size.svg?label=Marketplace&logo=github)](https://github.com/marketplace/actions/new-relic-capture--size)

A GitHub Action to capture a New Relic event describing your build size metrics.


## Inputs

| Key | Required | Default | Description |
| --- | --- | --- | --- |
| `analysis-file-contents` | **If `analysis-type` is not `manual` and no `analysis-file-url` values are supplied**  | - | Build analysis file contents -- Takes precendence over analysis-file-url when both are supplied. |
| `analysis-file-url` | **If `analysis-type` is not `manual` and no `analysis-file-contents` values are supplied**  | - | Public URL to the analysis file - When supplied without the analysis-file-contents, the action will fetch the file contents from the URL. It will decorate all events created with a link to the uploaded asset. |
| `analysis-type` | **If using `manual-*` values, must be `manual` | `webpack` | Type of analysis file to parse. Please note: `webpack` assumes the file supplied was generated using [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)|
| `commit` | - | `github.sha` | Commit identifier of the build |
| `event-type` | - | `BuildSize` | Type of event to be captured |
| `file-name-filter` | - | - | When supplied, will only include **entrypoint** file names that include the given substring - When undefined, will include everything in the analysis file |
| `manual-analysis-file-name` | **If `analysis-type` is `manual`** | - | Manually supply the file name of your build - Takes precendence over analysis-file-contents and analysis-file-url when supplied. Only works if analysis-type is "manual" |
| `manual-analysis-file-size` | **If `analysis-type` is `manual`** | - | Manually supply the file name of your build - Takes precendence over analysis-file-contents and analysis-file-url when supplied. Only works if analysis-type is "manual" |
| `manual-analysis-gzip-size` | **If `analysis-type` is `manual`** | - | Manually supply the file name of your build - Takes precendence over analysis-file-contents and analysis-file-url when supplied. Only works if analysis-type is "manual" |
| `nr-account-id` | **Always** | - | New Relic Account ID to be used to capture events |
| `nr-api-key` | **Always** | - | New Relic API key to be used to capture events |
| `nr-env` | - | `US` | NR Environment to be used to capture events. Valid values are `US`, `staging`.  `EU` to be supported in the future |
| `traverse` | - | `false` | When true, will traverse all subtrees and capture events for each item. Currently only supports `webpack` analysis type. |
| `trigger` | - | `build` | Trigger of the capturing the build size. Can be useful if you have differing reasons for capturing the build size across your repository. |
| `user` | - | `github.actor` | User who triggered the build |
| `version` | - | `github.ref_name` | Version of the build |


## Example usage

### GitHub secrets

[Github secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#about-encrypted-secrets) assumed to be set:
* `NEW_RELIC_API_KEY` - New Relic API key
* `NEW_RELIC_ACCOUNT_ID` - New Relic Account ID

>*There are a number of [default GitHub environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables) that are used in these examples as well.*
### Minimum required fields - analysis-file-url

```yaml
name: Capture Build Size With New Relic
on:
  workflow_dispatch:
  push:

jobs:
  report-build-size:
    runs-on: ubuntu-latest
    name: Report Webpack Stats To New Relic
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # This step parses the build stats (URL) and creates NR events
      - name: Capture Build Size
        uses: newrelic/capture-build-size@v1.0.0
        with:
          analysis-file-url: https://foo.bar/mybuild.stats.json
          nr-account-id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
          nr-api-key: ${{ secrets.NEW_RELIC_API_KEY }}
```

### Minimum required fields - analysis-file-contents

```yaml
name: Capture Build Size With New Relic
on:
  workflow_dispatch:
  push:

jobs:
  report-build-size:
    runs-on: ubuntu-latest
    name: Report Webpack Stats To New Relic
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # This step builds the code (and includes the webpack-bundle-analyzer)
      - name: Build 
        run: npm run build
      # This step reads the locally made stats file (assuming to be located in "./build")
      - name: Get local stats file
        id: get-stats
        shell: bash
        run: |
            stats=$(cat ./build/mybuild.stats.json); echo "stats=$stats" >> $GITHUB_OUTPUT;
      # This step parses the Build stats (file) and creates NR events
      - name: Capture Build Size
        uses: newrelic/capture-build-size@v1.0.0
        with:
          analysis-file-contents: ${{ steps.get-stats.output.stats }}
          nr-account-id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
          nr-api-key: ${{ secrets.NEW_RELIC_API_KEY }}
```

### Minimum required fields - manual-*
```yaml
name: Capture Build Size With New Relic
on:
  workflow_dispatch:
  push:

jobs:
  report-build-size:
    runs-on: ubuntu-latest
    name: Report Webpack Stats To New Relic
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # This step builds the code
      - name: Build 
        run: npm run build
      # This step parses the Build stats (file) and creates NR events
      - name: Capture Build Size
        uses: newrelic/capture-build-size@v1.0.0
        with:
          analysis-type: 'manual'
          manual-analysis-file-name: 'main-Build' # the file name to report
          manual-analysis-file-size: 12345 # Some value calculated manually
          nr-account-id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}in your build steps that does not rely on an explicit analysis file like webpack-build-analyzer 
          nr-api-key: ${{ secrets.NEW_RELIC_API_KEY }}
```

### All input fields example - analysis-file-url
```yaml
name: Capture Build Size With New Relic
on:
  pull_request: # run on pull request sync events

jobs:
  report-build-size:
    runs-on: ubuntu-latest
    name: Report Webpack Stats To New Relic
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # This step parses the Build stats (URL) and creates NR events
      - name: Capture Build Size
        uses: newrelic/capture-build-size@v1.0.0
        with:
          analysis-file-url: https://foo.bar/mybuild.stats.json # the webpack stats file URL
          analysis-type: 'webpack' # parse a webpack stats file
          commit: ${{ github.sha }} # the commit that triggered the action
          event-type: 'MyBuildSize' # report the event with a custom event type
          file-name-filter: '.min.js' # only include entrypoints that are minified
          nr-account-id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }} # US environment account
          nr-api-key: ${{ secrets.NEW_RELIC_API_KEY }} # US environment api key
          nr-env: 'US' # US environment
          traverse: true # Will create events for each sub-file in the analysis file
          trigger: 'PR' # Indicate the build was tied to a PR 
          user: ${{ github.actor }} # the user who raised the PR
          version: ${{ github.ref_name }} # the PR number tied to the action
```