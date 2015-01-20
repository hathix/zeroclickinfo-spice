(function(env) {
    "use strict";
    env.ddg_spice_headquarters = function(api_result) {

        // drill down the api_result to get at the raw wikitext content
        // it's at api_result.query.pages.{FIRST CHILD}.revisions[0]["*"]
        var query = api_result.query;
        if (!query) {
            return Spice.failed('headquarters');
        }
        var pages = query.pages;
        if (!pages) {
            return Spice.failed('headquarters');
        }

        // the page has some random id, but it's the only child of pages
        var page;
        for (var pageId in pages) {
            page = pages[pageId];
            break;
        }
        if (!page) {
            return Spice.failed('headquarters');
        }

        // while we're at it, grab the company's name, which is the wikipedia page title
        var companyName = page.title;
        if (!companyName) {
            return Spice.failed('headquarters');
        }
        var revisions = page.revisions;
        if (!revisions) {
            return Spice.failed('headquarters');
        }
        var revision = revisions[0];
        if (!revision) {
            return Spice.failed('headquarters');
        }
        var content = revision["*"];
        if (!content) {
            return Spice.failed('headquarters');
        }

        // find each set of {{ ... }}
        // use a stack to store the indices of the open {{'s
        // each }} will remove the most recent {{ (the last item added to the queue)
        // the actual text of the sets is stored in the sets array
        var stack = [],
            sets = [],
            length = content.length;

        for (var i = 0; i < length; /* no update since we do it manually */ ) {
            if (content.charAt(i) + content.charAt(i + 1) === "{{") {
                // beginning of a set
                stack.push(i);

                i += 2;
            } else if (content.charAt(i) + content.charAt(i - 1) === "}}") {
                // found the ending of a set; start of it was stack.pop()
                var start = stack.pop();
                var end = i;
                var set = content.substring(start, end + 1);
                sets.push(set);

                i += 2;
            } else {
                // neither start nor end
                i++;
            }
        }

        // find the first infobox, which is a set that begins with {{Infobox
        var harbinger = "{{Infobox",
            infoboxText = null;
        for (var i = 0; i < sets.length; i++) {
            var set = sets[i];
            if (set.indexOf(harbinger) === 0) {
                infoboxText = set;
                break;
            }
        }

        // answer must have infobox
        if (!infoboxText) {
            return Spice.failed('headquarters');
        }

        // split infobox into items (name, location, date founded, etc.)
        // these are {key: value} pairs stored in the infobox object
        var items = infoboxText.split("\n"),
            infobox = {}; // each item is { title: text }
        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                divide = item.indexOf("=");
            if (divide > -1) {
                var left = item.substring(0, divide);
                var right = item.substring(divide + 1);
                var titleArray = left.match(/\w+/);
                var title = titleArray[0];
                var text = right.trim();
                infobox[title] = text;
            }
        }

        /* ** BEGIN HEADQUARTERS-SPECIFIC CODE ** */

        // Cleans up a Wikipedia-formatted string, which can contain [[ ... ]] and <ref>'s.
        var cleanse = function(str) {
            // get rid of <ref>'s
            str = str.replace(/<ref[\S\s]+<\/ref>/g, "")
                .replace(/<ref[\S\s]+\/>/g, "")

            // get rid of {{cite}}'s
            .replace(/{{[^}]+}}/g, "")

            // get rid of any {{nowrap|...}}} stuff
            .replace(/{{ *nowrap *\| *([^}]+)}}/g, function(match, group) {
                return group;
            })

            // get rid of <br>'s and replace with comma
            .replace(/,? *<br *\/?>/g, ", ")

            // BUT if the line begins with parens, get rid of the comma.
            // This tends to happen because we strip <br>'s, which messes up stuff like
            // "New York<br>(US Headquarters)"
            .replace(/, \(/, "(")

            // replace stuff in [[ ... ]] with original (i.e. de-linkify)
            .replace(/\[\[([^\]]+)]]/g, function(match, group) {
                // if group has a |, return what's on the right side (that's the "display" version
                var barIndex = group.indexOf("|");
                if (barIndex > -1) {
                    return group.substring(barIndex + 1).trim();
                } else {
                    return group;
                }
            });

            return str;
        };

        var location = null;
        // walk down preference gradient until location found
        // wikipedia has several different ways to show headquarters location
        // hq_location is newer than location, and city + country is more specific than just location
        if (infobox.hq_location_city && infobox.hq_location_country) {
            location = cleanse(infobox.hq_location_city) + ", " + cleanse(infobox.hq_location_country);
        } else if (infobox.hq_location_city) {
            location = cleanse(infobox.hq_location_city);
        } else if (infobox.hq_location) {
            location = cleanse(infobox.hq_location);
        } else if (infobox.location_city && infobox.location_country) {
            location = cleanse(infobox.location_city) + ", " + cleanse(infobox.location_country);
        } else if (infobox.location_city) {
            location = cleanse(infobox.location_city);
        } else if (infobox.location) {
            location = cleanse(infobox.location);
        } else {
            // nothing found
            return Spice.failed('headquarters');
        }

        // is the location
        if (location) {
            // Success!

            var data = {
                name: companyName,
                headquarters: location,
                mapUrl: 'https://www.google.com/maps?q=' + location
            };

            Spice.add({
                id: "headquarters",
                name: "Headquarters",
                data: data,
                meta: {
                    sourceName: "Google Maps",
                    sourceUrl: 'https://www.google.com/maps?q=' + location
                },
                templates: {
                    group: 'base',
                    options: {
                        content: Spice.headquarters.content,
                        moreAt: true
                    }
                }
            });
        } else {
            return Spice.failed('headquarters');
        }
    };
}(this));