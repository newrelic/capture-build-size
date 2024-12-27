const core = require('@actions/core')
const { checkRequiredInputs, getFileContentsAsJson, createEvents, reportEvents } = require('./utils.js')

execute() 

async function execute(){
    try {
        checkRequiredInputs()
        const analysisFileContentsJson = await getFileContentsAsJson()
        const sent = await reportEvents(createEvents(analysisFileContentsJson))
        if (sent?.success) {
            console.log(`Results uploaded to New Relic - ${sent.uuid}`)
            console.log(`Query your data like "SELECT * FROM ${core.getInput('event-type')}" under the provided New Relic account`)
            core.setOutput('nr-response', JSON.stringify(sent))
        }
        else core.setFailed('Failed to upload results to New Relic')
    } catch (error) {
        core.setFailed(error.message);
    }
}
