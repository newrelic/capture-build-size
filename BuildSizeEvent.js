const core = require('@actions/core')

module.exports = class BuildSizeEvent {
    eventType = core.getInput('event-type') // Defaults to 'BuildSize' if not explicitly set
    version = core.getInput('version') // Defaults to the branch ref if not explicitly set
    commit = core.getInput('commit')
    user = core.getInput('user')
    trigger = core.getInput('trigger')
    analysisType = core.getInput('analysis-type')
    analysisFileUrl = core.getInput('analysis-file-url')

    constructor(asset, entry) {
        this.fileName = asset.label
        this.fileSize = asset.parsedSize
        this.gzipSize = asset.gzipSize
        this.entryPoint = entry || asset.label
        this.path = asset.path

        try {
            this.isInitialEntrypoint = !!(Object.keys(asset.isInitialByEntrypoint).length)
        } catch (err) {
            this.isInitialEntrypoint = false
        }
    }
}