var req;
var search_link;
var search_query;

function onSelection(query) {
    clearList();

    var query_field = document.getElementById("query_field");
    if (typeof(query) == "undefined") {
        query = query_field.value;
        document.getElementById("query_field");
    } else {
        query_field.value = query;
    }
    query = prepareString(query);

    if (typeof(query) != "undefined" && query.length > 0) {

				search_query = query;

        setFooter({
            message: "searching...",
            href: null,
            search_animation: true
        });

        var req = new XMLHttpRequest();
        search_link = 'http://www.urbandictionary.com/define.php?term=' + query;
        req.open('GET', search_link, true);
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    parseResponse(req.responseText);
                }
                else {
                    console.log("Error loading page\n");
                }
            }
        };

        req.send(null);
    } else {
        setFooter({
            message: "search an expression",
            href: null,
            search_animation: false
        });
    }
};

function parseResponse(response) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = response.replace("/<script(.|\s)*?\/script>/g", '');

    var indexes = tempDiv.getElementsByClassName('index');
    var words = tempDiv.getElementsByClassName('word');
    var definitions = tempDiv.getElementsByClassName('definition');
    var examples = tempDiv.getElementsByClassName('example');
    var tags = tempDiv.getElementsByClassName('greenery');

    var list = document.getElementById("list");
    var results = document.createElement('div');
    results.id = 'results';

    for (var i = 0; i < words.length && i < 1; i++) {
        var url = indexes[i].innerHTML.match(/href=\"(.*?)\"/);

        var result = document.createElement('div');
        result.className = 'result';

        var word = document.createElement('div');
        word.className = 'word';
        word.innerHTML = "<a target=\"_blank\" href=\"" + url[1] + "\">" + words[i].innerHTML + "</a>";
        result.appendChild(word);

        var definition = document.createElement('div');
        definition.className = 'definition';
        definition.innerHTML = strip(definitions[i].innerHTML);

        if (examples[i].innerHTML != "") {
            var example = document.createElement('div');
            example.className = 'example';
            example.innerHTML = strip(examples[i].innerHTML);
            // example.innerHTML = examples[i].innerHTML;
            definition.appendChild(example);
        }

        var clean_tags = getTags(tags[i + 1]);
        if (clean_tags.length > 0) {
            var tags_element = document.createElement('div');
            tags_element.className = 'tags';

            for (var i = 0; i < clean_tags.length; i++) {
                var tag = document.createElement('a');
                tag.className = 'tag';
                tag.href = "javascript:onSelection(\"" + clean_tags[i] + "\");";
                tag.innerHTML = clean_tags[i];

                tags_element.appendChild(tag);
            }

            definition.appendChild(tags_element);
        }

        result.appendChild(definition);
        results.appendChild(result);
    }

    if (words.length > 0) {
        list.appendChild(results);
        setFooter("more results", search_link, false);

        setFooter({
            message: "more results",
            href: search_link,
            search_animation: false
        });
    } else {
        var link = "http://www.google.com/search?q=" +

        setFooter({
            message: "no results, but click here to try Google",
            href: "http://www.google.com/search?q=" + search_query,
            search_animation: false
        });
    }
}


function getTags(raw_tags) {
    var tags = raw_tags.getElementsByClassName("urbantip");
    var clean_tags = [];

    // last tag is ignored because it is the author
    for (var i = 0; i < tags.length - 1; i++) {
        clean_tags.push(strip(tags[i].innerHTML));
    }

    return clean_tags;
}

function prepareString(s) {
    s = s.replace(/^\s+|\s+$/g, "");
    s = s.replace(/ /g, "+");
    return s;
}

function strip(html) {
    html = html.replace(/<a.+href=".*?".*>(.*?)<\/a>/gi, "<a class=\"tag\" href=\"javascript:onSelection(\'$1\');\">$1</a>");
    return html;
}

function setFooter(params) {
    var footer = document.getElementById("footer_text");
    footer.innerHTML = params["message"];
    footer.href = params["href"];

    search_gif = document.getElementById("searching_gif");
    search_gif.style.display = (params["search_animation"] ? '': 'none');
}

function clearList() {
    var firstChild = list.firstChild;
    if (firstChild != null) {
        list.removeChild(list.firstChild);
    }
}