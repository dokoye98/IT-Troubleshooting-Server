
function topicCheck(topic){
    const currentTopics = ["networking","troubleshooting","hardware"]
    let formattedTopics = topic.toLowerCase()
    if(currentTopics.includes(formattedTopics)){
        return formattedTopics
    }else{
        return null
    }
}

module.exports = topicCheck