
function difficulty(topic){
    const currentTopics = ["easy","hard"]
    if (!topic || typeof topic !== 'string') {
        console.log(topic)
        return null
    }
    let formattedTopics = topic.toLowerCase()
    if(currentTopics.includes(formattedTopics)){
        return formattedTopics
    }else{
        return null
    }
}

module.exports = difficulty