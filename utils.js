const core = require('@actions/core')
const BuildSizeEvent = require('./BuildSizeEvent')

const manualAnalysisFileName = core.getInput('manual-analysis-file-name')
const manualAnalysisFileSize = core.getInput('manual-analysis-file-size')
const manualAnalysisGzipSize = core.getInput('manual-analysis-gzip-size')

const analysisFileUrl = core.getInput('analysis-file-url')
const analysisFileContents = core.getInput('analysis-file-contents')
const analysisType = core.getInput('analysis-type')

async function getFileContentsAsJson() {
    if (analysisType === 'manual' && !!manualAnalysisFileName && !!(!!manualAnalysisFileSize || !!manualAnalysisGzipSize)) {
        console.log('Using manual analysis values')
        return [{ label: manualAnalysisFileName, parsedSize: manualAnalysisFileSize, gzipSize: manualAnalysisGzipSize }]
    } else if (analysisFileContents) {
        console.log("Using analysis file contents")
        return JSON.parse(analysisFileContents)
    } else if (analysisFileUrl) {
        console.log('Fetching analysis file from', analysisFileUrl)
        return await fetch(analysisFileUrl).then((r) => r.json())
    } else throw new Error('Could not determine build analysis file source - Check your configurations')
}


function createEvents(analysisFileContentsJson) {
    const objectsToReport = []

    const shouldTraverse = JSON.parse(core.getInput('traverse')) && analysisType === 'webpack'

    const fileFilter = core.getInput('file-name-filter')
    const fileFilterFn = (asset) => fileFilter ? asset.label.includes(fileFilter) : true
    analysisFileContentsJson.filter(fileFilterFn).forEach((asset => parseAsset(asset, undefined)))

    return objectsToReport

    function parseAsset(asset, entry) {
        const { entryPoint } = objectsToReport.push(new BuildSizeEvent(asset, entry))
        if (shouldTraverse && asset.groups) {
            asset.groups.forEach((group) => {
                parseAsset(group, entryPoint)
            })
        }
    }
}

async function reportEvents(objectsToReport) {
        const env = core.getInput('nr-env')
        let envDomain = ''
        switch (env) {
            case 'US':
                envDomain = 'https://insights-collector.newrelic.com'
                break
            case 'EU':
                envDomain = 'https://insights-collector.eu.newrelic.net'
                break
            case 'staging':
                envDomain = 'https://staging-insights-collector.newrelic.com'
                break
            default:
                throw new Error('Invalid NR environment')
        }
        
        console.log(`Reporting ${objectsToReport.length} "${core.getInput('event-type')}" events to ${envDomain}/v1/accounts/${core.getInput('nr-account-id')}/events`)

        return await fetch(`${envDomain}/v1/accounts/${core.getInput('nr-account-id')}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': core.getInput('nr-api-key')
            },
            body: JSON.stringify(objectsToReport)
        })
            .then((r) => r.json())
}

function checkRequiredInputs(){
    if (core.getInput('analysis-type') === 'webpack' && !(core.getInput('analysis-file-contents') || core.getInput('analysis-file-url'))) throw new Error('Missing required input: analysis-file-contents or analysis-file-url') 
    if (core.getInput('analysis-type') === 'manual' && !(core.getInput('manual-analysis-file-name') && (core.getInput('manual-analysis-file-size') || core.getInput('manual-analysis-gzip-size')))) throw new Error('Missing required input: manual-analysis-file-name, manual-analysis-file-size or manual-analysis-gzip-size')
    if (!core.getInput('nr-account-id')) throw new Error('Missing required input: nr-account-id')
    if (!core.getInput('nr-api-key')) throw new Error('Missing required input: nr-api-key')
}

module.exports = {
    checkRequiredInputs,
    getFileContentsAsJson,
    createEvents,
    reportEvents
}