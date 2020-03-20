function load() {
    links.forEach(group => {
        var divParent = createDivGroup(group.name);
        group.items.forEach(link => {
            createDivLink(link, divParent);
        })
    });
}

function createDivGroup(groupName) {
    var div = document.createElement("div");
    div.classList.add("group");
    
    var divTitle = document.createElement("div");
    divTitle.classList.add("groupTitle");
    divTitle.innerText = groupName;
    div.appendChild(divTitle);
    
    var divChild = document.createElement("div");
    divChild.classList.add("groupChild");
    div.appendChild(divChild);

    $("principal").appendChild(div);
    return divChild;
}

function createDivLink(grouplinkName, divParent) {
    var div = document.createElement("div");
    div.classList.add("link");
    div.innerText = grouplinkName.name;
    divParent.appendChild(div);
}

function $(el) {
    return document.getElementById(el);
}

load();
// document.addEventListener("load", load);