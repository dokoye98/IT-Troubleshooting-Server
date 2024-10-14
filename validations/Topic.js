
function topicCheck(topic){
    const currentTopics = ["networking","troubleshooting","hardware","general"]
    if (!topic || typeof topic !== 'string') {
        return null
    }
    let formattedTopics = topic.toLowerCase()
    if(currentTopics.includes(formattedTopics)){
        return formattedTopics
    }else{
        return null
    }
}

module.exports = topicCheck