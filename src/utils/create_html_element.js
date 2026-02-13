export function copyTemplate(exisiting_id, new_id){
    const templateElement = document.querySelector(`#${exisiting_id}`)
    const copiedElement = templateElement.cloneNode()
    copiedElement.id = new_id
    copiedElement.style.visibility = "visible"
    templateElement.add
    templateElement.parentNode.insertBefore(copiedElement, templateElement.nextSibling);
    return copiedElement
}